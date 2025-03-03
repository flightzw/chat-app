import { ChatInfo } from './chat';

function genChatMapKey(chatID: number) {
  return `${chatID}`;
}

function newChatMap(chats: ChatInfo[]) {
  return new Map(chats.map((chat) => [genChatMapKey(chat.id), chat]));
}

export { genChatMapKey, newChatMap };
