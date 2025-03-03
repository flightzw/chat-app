import request, { RespResult } from './request';

export type FriendInfo = {
  id: number;
  username: string;
  avatar_url: string;
  nickname: string;
  gender: number;
  signature: string;
  remark: string;
  is_online: boolean;
};

export function addFriend(userID: number): Promise<RespResult<undefined>> {
  return request.post('/v1/friends', { user_id: userID });
}

export function getFriend(userID: number): Promise<RespResult<FriendInfo>> {
  return request.get(`/v1/friends/${userID}`);
}

export function listFriend(): Promise<RespResult<FriendInfo[]>> {
  return request.get('/v1/friends');
}

export function updateFriend(userID: number, remark: string): Promise<RespResult<undefined>> {
  return request.put(`/v1/friends/${userID}`, { remark: remark });
}

export function removeFriend(userID: number): Promise<RespResult<undefined>> {
  return request.delete(`/v1/friends/${userID}`);
}
