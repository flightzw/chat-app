import { msgApi } from '@/api';
import localforage from 'localforage';
import { ChatInfo } from './chat';

type chatInfo = {
  id: number;
  name: string;
  avatarUrl: string;
};

type chatStore = {
  maxMsgID: number;
  chats: chatInfo[];
};

function getChatStoreKey(userID: number) {
  return `chat-app:uid:${userID}:chats`;
}

function getMsgListStoreKey(userID: number, chatID: number) {
  return `chat-app:uid:${userID}:chat:${chatID}:msgs`;
}

/** 获取会话列表 */
export async function getChatStore(userID: number): Promise<chatStore> {
  const data = await localforage.getItem<chatStore>(getChatStoreKey(userID));
  if (!data) {
    return { maxMsgID: 0, chats: [] };
  }
  return data;
}

/** 保存会话列表 */
export function setChatStore(userID: number, maxMsgID: number, chats: ChatInfo[]) {
  const data: chatInfo[] = chats.map((chat) => ({
    id: chat.id,
    name: chat.name,
    avatarUrl: chat.avatarUrl,
  }));
  localforage.setItem<chatStore>(getChatStoreKey(userID), {
    maxMsgID: maxMsgID,
    chats: data,
  });
}

/** 清空会话列表 */
export async function clearChatStore(userID: number) {
  return await localforage.removeItem(getChatStoreKey(userID));
}

/** 获取会话消息 */
export async function getMsgList(userID: number, chatID: number): Promise<msgApi.PrivateMessage[]> {
  const data = await localforage.getItem<msgApi.PrivateMessage[]>(getMsgListStoreKey(userID, chatID));
  if (!data) {
    return [];
  }
  return data;
}

/** 保存会话消息 */
export function setMsgList(userID: number, ...chats: ChatInfo[]) {
  if (chats.length === 0) {
    return;
  }
  for (const chat of chats) {
    // localforage.setItem(getMsgListStoreKey(userID, chat.id), chat.getMessages().slice(1000));
    localforage.setItem(getMsgListStoreKey(userID, chat.id), chat.getMessages());
  }
}

// 移除会话消息
export async function removeMsgList(userID: number, chatID: number) {
  return await localforage.removeItem(getMsgListStoreKey(userID, chatID));
}
