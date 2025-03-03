import { userApi } from '@/api';
import { StateCreator } from 'zustand';
import { getToken } from './auth';
import { jwtDecode } from 'jwt-decode';

export interface UserState {
  user: userApi.UserInfo;
  fetchUserInfo: () => Promise<void>;
}

function initUserInfo() {
  const unknownUser = {
    id: 0,
    username: 'UNKNOWN',
    nickname: 'UNKNOWN',
    avatar_url: '',
    gender: 0,
    signature: '',
    is_online: false,
  };
  const token = getToken();
  if (!token) {
    return unknownUser;
  }
  try {
    const data = jwtDecode(token);
    return {
      id: (data.jti && parseInt(data.jti)) || 0,
      username: data.sub || 'UNKNOWN',
      nickname: data.sub || 'UNKNOWN',
      avatar_url: '',
      gender: 0,
      signature: '',
      is_online: true,
    };
  } catch (err) {
    console.log('token parse failed:', err);
  }
  return unknownUser;
}

const createUserSlice: StateCreator<UserState> = (set) => ({
  user: initUserInfo(),
  fetchUserInfo: async () => {
    const { data } = await userApi.getSelfInfo();
    set({
      user: { ...data },
    });
  },
});

export default createUserSlice;
