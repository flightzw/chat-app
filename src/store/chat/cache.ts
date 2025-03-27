import { msgApi } from '@/api';
import { ChatInfo, ChatType } from './chat';
import * as util from './util';
import * as persist from './persist';

export type ChatCache = {
  /** 用户 uid */
  userID: number;
  /** 会话列表 */
  chats: ChatInfo[];
  /** 会话 map */
  chatMap: Map<string, ChatInfo>;
  /** 已接收私聊消息 maxId */
  maxMsgID: number;
  /** 离线消息推送标记, true: 正在推送, false: 推送结束 */
  isLoading?: boolean;
};

async function loadingChatData(userID: number): Promise<ChatCache> {
  try {
    // 获取本地会话数据
    const store = await persist.getChatStore(userID);

    const chats: ChatInfo[] = [];
    for (const info of store.chats) {
      // 获取会话对应的消息数据
      const msgs = await persist.getMsgList(userID, info.id);
      chats.push(new ChatInfo(info.id, info.avatarUrl, info.name, userID, info.type, ...msgs));
    }
    return { userID: userID, chats: chats, chatMap: util.newChatMap(chats), maxMsgID: store.maxMsgID };
  } catch (err) {
    console.warn('loading local data failed:', err);
    return { userID: userID, chats: [], chatMap: util.newChatMap([]), maxMsgID: 0 };
  }
}

function saveOrUpdateChatCache(cache: ChatCache, newChat: ChatInfo, data: msgApi.PrivateMessage) {
  // 更新最大消息 id
  if (newChat.type !== ChatType.AI && data.id > cache.maxMsgID) {
    cache.maxMsgID = data.id;
  }

  const chatMapKey = util.genChatMapKey(newChat.id);
  const chat = cache.chatMap.get(chatMapKey);
  if (!chat) {
    // 新增会话
    cache.chats.push(newChat);
    cache.chatMap.set(chatMapKey, newChat);
    newChat.appendMessage(data);
    return;
  }
  if (chat.hasMessage(data.id) && data.status === msgApi.MessageStatus.Recall) {
    return chat.recallMessage(data);
  }
  chat.appendMessage(data);
}

export { loadingChatData, saveOrUpdateChatCache };
