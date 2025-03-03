import { getRefreshToken } from '@/store/auth';
import request, { RespResult } from './request';

export type LoginInfo = {
  username: string;
  password: string;
  remember_me?: boolean;
};

export type RegisterInfo = {
  username: string;
  nickname: string;
  password: string;
};

export type UpdateUserForm = {
  nickname: string;
  gender: number;
  signature: string;
};

export type UpdatePasswordForm = {
  old_password: string;
  new_password: string;
};

export type UserInfo = {
  id: number;
  username: string;
  avatar_url: string;
  nickname: string;
  gender: number;
  signature: string;
  is_online: boolean;
};

type LoginResult = {
  token: string;
  refresh_token: string;
};

export function login(info: LoginInfo): Promise<RespResult<LoginResult>> {
  return request.post('/v1/login', info);
}

export function register(info: RegisterInfo): Promise<RespResult<undefined>> {
  return request.post('/v1/register', info);
}

export function refreshToken(): Promise<RespResult<LoginResult>> {
  return request.get('/v1/refresh-token', {
    headers: { Authorization: 'Bearer ' + getRefreshToken() },
  });
}

export function getSelfInfo(): Promise<RespResult<UserInfo>> {
  return request.get('/v1/users/self');
}

export function getUserByID(id: number): Promise<RespResult<UserInfo>> {
  return request.get(`/v1/users/${id}`);
}

export function listUserInfo(name: string): Promise<RespResult<UserInfo[]>> {
  return request.get('/v1/users', {
    params: {
      name: name,
    },
  });
}

export function updateUserInfo(form: UpdateUserForm): Promise<RespResult<undefined>> {
  return request.put('/v1/users', form);
}

export function updatePassword(form: UpdatePasswordForm): Promise<RespResult<undefined>> {
  return request.put('/v1/users/password', form);
}
