import { StateCreator } from 'zustand';

import { friendApi, msgApi, ws } from '@/api';
import { ChatInfo, DraftInfo, ChatType } from './chat';
import * as util from './util';
import * as persist from './persist';
import * as cache from './cache';

export interface ChatState {
  chatStore: {
    /** 会话列表 */
    chats: ChatInfo[];
    /** 会话 map */
    chatMap: Map<string, ChatInfo>;
    /** 当前窗口对应会话 */
    activeChat?: ChatInfo;
    /** 最大消息 id */
    maxMsgID: number;
    /** websocket 连接状态 */
    connStat: ws.ConnStatus;
  };
  /** 保存会话数据 */
  initChatStore: (cache: cache.ChatCache) => void;
  /** 切换当前会话 */
  setActiveChat: (chatIdx: number) => void;
  /** 同步草稿内容 */
  setActiveChatDraft: (draft: DraftInfo) => void;
  /** 创建会话 */
  openChat: (chat: ChatInfo, setActiveChat?: boolean) => void;
  /** 移除会话 */
  removeChat: (id: number) => void;
  /** 写入或更新消息状态 */
  saveOrUpdateMessage: (chatId: number, data: msgApi.PrivateMessage) => void;
  /** 写入消息 */
  insertMessage: (chatId: number, data: msgApi.PrivateMessage) => void;
  /** 已读消息 */
  readedMessage: (chatId: number, selfReaded: boolean) => void;
  /** 删除消息 */
  deleteMessage: (chatId: number, id: number) => void;
  /** 设置连接状态 */
  setConnStatus: (status: ws.ConnStatus) => void;
  /** 清空本地数据 */
  clearChatData: (userID: number) => Promise<void>;
}

const createChatState: StateCreator<ChatState> = (set) => ({
  chatStore: {
    chats: [],
    chatMap: util.newChatMap([]),
    maxMsgID: 0,
    connStat: ws.ConnStatus.WaitConnect,
  },
  initChatStore: (cache: cache.ChatCache) => {
    persist.setChatStore(cache.userID, cache.maxMsgID, cache.chats);
    persist.setMsgList(cache.userID, ...cache.chats);
    set((state) => ({
      chatStore: {
        chats: [...cache.chats],
        chatMap: cache.chatMap,
        maxMsgID: cache.maxMsgID,
        connStat: state.chatStore.connStat,
      },
    }));
  },
  setActiveChat: (idx: number) => {
    set((state) => {
      const { activeChat, chats } = state.chatStore;
      if (chats.length <= idx || chats[idx] === activeChat) {
        return state;
      }
      return {
        chatStore: {
          ...state.chatStore,
          activeChat: chats[idx],
        },
      };
    });
  },
  setActiveChatDraft: (draft: DraftInfo) => {
    set((state) => {
      const { activeChat } = state.chatStore;
      if (activeChat) {
        activeChat.draft = draft;
      }
      return { chatStore: { ...state.chatStore } };
    });
  },
  openChat: (chat: ChatInfo, setActiveChat?: boolean) => {
    set((state) => {
      const chatMapKey = util.genChatMapKey(chat.id);
      const { chats, maxMsgID, chatMap } = state.chatStore;
      if (chatMap.has(chatMapKey)) {
        return setActiveChat ? { chatStore: { ...state.chatStore, activeChat: chatMap.get(chatMapKey) } } : state;
      }
      const newChats = [chat, ...chats];
      persist.setChatStore(chat.userID, maxMsgID, newChats);
      return {
        chatStore: {
          ...state.chatStore,
          chats: newChats,
          chatMap: chatMap.set(chatMapKey, chat),
          activeChat: setActiveChat ? chat : state.chatStore.activeChat,
        },
      };
    });
  },
  removeChat: (id: number) => {
    set((state) => {
      const { chats, chatMap, maxMsgID, activeChat } = state.chatStore;
      const chat = chatMap.get(util.genChatMapKey(id));
      if (!chat) {
        return state;
      }
      const newChats = chats.filter((chat) => chat.id != id);
      chatMap.delete(util.genChatMapKey(id));

      persist.setChatStore(chat.userID, maxMsgID, newChats);
      persist.removeMsgList(chat.userID, chat.id);
      return {
        chatStore: {
          ...state.chatStore,
          chats: newChats,
          chatMap: chatMap,
          activeChat: activeChat && activeChat.id === id ? undefined : activeChat,
        },
      };
    });
  },
  saveOrUpdateMessage: (chatId: number, data: msgApi.PrivateMessage) => {
    set((state) => {
      const { chats, chatMap, maxMsgID } = state.chatStore;
      const chat = chatMap.get(util.genChatMapKey(chatId));
      if (!chat) {
        return state;
      }
      let ok = false;
      if (chat.hasMessage(data.id) && data.status === msgApi.MessageStatus.Recall) {
        ok = chat.recallMessage(data);
      } else {
        ok = chat.appendMessage(data);
      }
      if (ok) {
        persist.setChatStore(chat.userID, Math.max(maxMsgID, data.id), chats);
        persist.setMsgList(chat.userID, chat);
      }
      return ok ? { chatStore: { ...state.chatStore, maxMsgID: Math.max(maxMsgID, data.id) } } : state;
    });
  },
  insertMessage: (chatId: number, data: msgApi.PrivateMessage) => {
    set((state) => {
      const { chats, chatMap, maxMsgID } = state.chatStore;
      const chat = chatMap.get(util.genChatMapKey(chatId));
      if (!chat || !chat.appendMessage(data)) {
        return state;
      }
      persist.setChatStore(chat.userID, Math.max(maxMsgID, data.id), chats);
      persist.setMsgList(chat.userID, chat);
      return { chatStore: { ...state.chatStore, maxMsgID: Math.max(maxMsgID, data.id) } };
    });
  },
  readedMessage: (chatId: number, selfReaded: boolean) => {
    set((state) => {
      const chat = state.chatStore.chatMap.get(util.genChatMapKey(chatId));
      if (!chat || !chat.readedMessage(selfReaded)) {
        return state;
      }
      persist.setMsgList(chat.userID, chat);
      return { chatStore: { ...state.chatStore } };
    });
  },
  deleteMessage: (chatId: number, id: number) => {
    set((state) => {
      const chat = state.chatStore.chatMap.get(util.genChatMapKey(chatId));
      if (!chat || !chat.removeMessage(id)) {
        return state;
      }
      persist.setMsgList(chat.userID, chat);
      return { chatStore: { ...state.chatStore } };
    });
  },
  setConnStatus: (status: ws.ConnStatus) => {
    set((state) => ({
      chatStore: {
        ...state.chatStore,
        connStat: status,
      },
    }));
  },
  clearChatData: async (userID: number) => {
    const { chats } = await persist.getChatStore(userID);
    for (const chat of chats) {
      await persist.removeMsgList(userID, chat.id);
    }
    await persist.clearChatStore(userID);
    set((state) => {
      return {
        chatStore: {
          chats: [],
          chatMap: util.newChatMap([]),
          maxMsgID: 0,
          connStat: state.chatStore.connStat,
        },
      };
    });
  },
});

export function newChatInfoByFriend(userID: number, friend: friendApi.FriendInfo) {
  return new ChatInfo(friend.id, friend.avatar_url, friend.remark || friend.nickname, userID);
}

export default createChatState;
export { cache, ChatType, ChatInfo };
