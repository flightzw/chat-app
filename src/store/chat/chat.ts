import { msgApi } from '@/api';

/** 会话类型 */
export enum ChatType {
  /** 私聊 */
  Private = 1,
  /** 群聊 */
  Group,
}

export type DraftInfo = {
  text: string;
  count: number;
};

export type ChatParams = {
  /** 会话 id（好友 id） */
  id: number;
  /** 名称 */
  name: string;
  /** 头像 */
  avatarUrl: string;
  /** 当前用户 id */
  userID: number;
};

export class ChatInfo {
  /** 会话 id（好友 id） */
  readonly id: number;
  readonly type: ChatType = ChatType.Private;
  /** 会话名称（好友昵称） */
  name: string;
  /** 会话头像 */
  avatarUrl: string;
  /** 当前用户 id */
  readonly userID: number;
  /** 未读消息数 */
  private unreadCount = 0;
  /** 最新消息摘要 */
  /** 消息列表 */
  private messages: msgApi.PrivateMessage[] = [];
  /** 消息 map */
  private messageMap = new Map<number, msgApi.PrivateMessage>();
  /** 草稿 */
  draft: DraftInfo = { text: '', count: 0 };

  constructor(chatID: number, avatarUrl: string, name: string, userID: number, ...msgs: msgApi.PrivateMessage[]) {
    this.id = chatID;
    this.avatarUrl = avatarUrl;
    this.name = name;
    this.userID = userID;
    // this.messages = genMockMessage(chatID, userID);
    // this.messageMap = new Map(this.messages.map((item) => [item.id, item]));

    for (const msg of msgs) {
      this.messages = [...this.messages, msg];
      this.messageMap.set(msg.id, msg);
      if (msg.send_id !== userID && msg.status <= msgApi.MessageStatus.Unread) {
        this.unreadCount++; // 他人发送 & 未读，消息未读数 + 1
      }
    }
    this.messages.sort((a, b) => a.id - b.id);
  }

  getUnreadCount() {
    return this.unreadCount;
  }

  getLastContent() {
    return this.messages.length > 0 ? this.messages.at(-1)!.content : '';
  }

  getLastSendTime() {
    return this.messages.length > 0 ? this.messages.at(-1)!.created_at : '';
  }

  getMessages() {
    return this.messages;
  }

  hasMessage(msgId: number) {
    return this.messageMap.has(msgId);
  }

  getMaxMsgId() {
    if (this.messages.length < 1) {
      return 0;
    }
    return this.messages.at(-1)!.id;
  }

  // 新增消息
  appendMessage(msg: msgApi.PrivateMessage) {
    if (this.messageMap.has(msg.id)) {
      return false;
    }
    this.messages = [...this.messages, msg];
    this.messages.sort((a, b) => a.id - b.id);
    this.messageMap.set(msg.id, msg);
    if (msg.send_id !== this.userID && msg.status <= msgApi.MessageStatus.Unread) {
      this.unreadCount++; // 他人发送 & 未读，未读数 + 1
    }
    return true;
  }

  /** 我方/对方已读消息 */
  readedMessage(selfReaded: boolean) {
    let count = 0;
    const len = this.messages.length;

    // 倒序查找，避免全量扫描
    for (let idx = len - 1; idx >= 0; idx--) {
      const msg = this.messages[idx];
      if (msg.status === msgApi.MessageStatus.Readed) {
        break; // 当前消息已读，则之前的消息都已读
      }
      // 我方已读消息 or 对方已读消息
      if ((selfReaded && msg.send_id !== this.userID) || (!selfReaded && msg.send_id === this.userID)) {
        msg.status = msgApi.MessageStatus.Readed;
        count++;
      }
    }
    if (selfReaded) {
      this.unreadCount -= count;
    }
    return count != 0;
  }

  /** 撤回消息 */
  recallMessage(msg: msgApi.PrivateMessage) {
    const data = this.messageMap.get(msg.id);
    if (!data || data.status === msgApi.MessageStatus.Recall) {
      return false;
    }
    if (data.send_id !== this.userID && data.status <= msgApi.MessageStatus.Unread) {
      this.unreadCount--; // 对方撤回消息，未读数 - 1
    }
    data.status = msgApi.MessageStatus.Recall;
    data.content = msg.content;
    return true;
  }

  removeMessage(msgId: number) {
    const chat = this.messageMap.get(msgId);
    if (!chat || chat.status === msgApi.MessageStatus.Recall) {
      return false;
    }
    this.messages = this.messages.filter((msg) => msg.id != msgId);
    this.messageMap.delete(msgId);
    return true;
  }
}

// function genMockMessage(chatID: number, userID: number, rows = 1000) {
//   const data = [];
//   for (let idx = 0; idx < rows; idx++) {
//     data.push({
//       id: -rows + idx,
//       send_id: idx % 2 === 0 ? chatID : userID,
//       recv_id: idx % 2 !== 0 ? chatID : userID,
//       content: '测试消息',
//       type: msgApi.MessageType.Text,
//       status: msgApi.MessageStatus.Readed,
//       created_at: '2024-01-01 00:00:00',
//     });
//   }
//   return data;
// }
