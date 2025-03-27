import request, { RespResult } from './request';

export enum MessageType {
  Text = 1,
  Image,
  File,
  AIChat = 7,
}

export enum MessageStatus {
  /** 未送达 */
  Unsend = 0,
  /** 未读 */
  Unread = 1,
  /** 撤回 */
  Recall,
  /** 已读 */
  Readed,
}

// 私聊消息
export type PrivateMessage = {
  id: number;
  send_id: number;
  recv_id: number;
  content: string;
  type: MessageType;
  status: MessageStatus;
  created_at: string;
};

export type SendInfo = {
  type: MessageType;
  recv_id: number;
  content: string;
};

export type PrivateMessageQuery = {
  friend_id?: number;
  keyword?: string;
  send_date_gte?: string;
  send_date_lte?: string;
};

export function sendPrivateMessage(info: SendInfo): Promise<RespResult<PrivateMessage>> {
  return request.post('/v1/private-messages/send', info);
}

export function recallPrivateMessage(id: number): Promise<RespResult<null>> {
  return request.put(`/v1/private-messages/recall/${id}`, {});
}

/**
 * 通知服务端推送离线消息
 * @param startId 消息起始 id
 */
export function pullOfflineMessage(startId: number): Promise<RespResult<null>> {
  return request.get('/v1/private-messages/offline', {
    params: { start_id: startId },
  });
}

export function readedPrivateMessage(friendId: number): Promise<RespResult<null>> {
  return request.put('/v1/private-messages/readed', { friend_id: friendId });
}

export function listPrivateMessage(
  params: PrivateMessageQuery,
  page: number,
  pageSize = 100
): Promise<RespResult<PrivateMessage[]>> {
  return request.get('/v1/private-messages', {
    params: {
      ...params,
      page: page,
      page_size: pageSize,
    },
  });
}
