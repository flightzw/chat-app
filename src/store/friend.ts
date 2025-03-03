import { friendApi } from '@/api';
import { StateCreator } from 'zustand';

export interface FriendState {
  friendStore: { friends: friendApi.FriendInfo[] };
  fetchFriendInfo: () => Promise<void>;
  appendFriend: (friend: friendApi.FriendInfo) => void;
  setFriendRemark: (friendID: number, remark: string) => void;
}

const mockData = [
  {
    id: 10001,
    username: 'xiaoming',
    nickname: '小明',
    avatar_url: '',
    remark: '',
    gender: 1,
    signature: '',
    is_online: true,
  },
  {
    id: 10002,
    username: 'xiaofang',
    nickname: '小芳',
    avatar_url: '',
    remark: '',
    gender: 2,
    signature: '',
    is_online: true,
  },
  {
    id: 10003,
    username: 'xiaozhe123',
    nickname: '小哲',
    avatar_url: '',
    remark: '',
    gender: 1,
    signature: '',
    is_online: false,
  },
];

function genMockFriends(startId: number, num: number) {
  const data = [];
  for (let idx = 0; idx < num; idx++) {
    data.push({
      id: startId + idx,
      username: `mockfriend-${idx}`,
      nickname: `好友${idx}`,
      avatar_url: '',
      gender: idx % 2,
      signature: '',
      remark: `这是备注111111111111111111111111111111111111111111-${idx}`,
      is_online: idx % 2 == 0,
    });
  }
  return data;
}

const createFriendSlice: StateCreator<FriendState> = (set) => ({
  friendStore: { friends: [...mockData, ...genMockFriends(20000, 16)] },
  fetchFriendInfo: async () => {
    try {
      const { data } = await friendApi.listFriend();
      set((state) => {
        const { friends } = state.friendStore;
        friends.splice(0, friends.length, ...data);
        return { friendStore: { friends } };
      });
    } catch (err) {
      console.error('friendApi.listFriend:', err);
    }
  },
  appendFriend: (friend: friendApi.FriendInfo) => {
    set((state) => {
      const { friends } = state.friendStore;
      friends.push(friend);
      return { friendStore: { friends } };
    });
  },
  setFriendRemark: (friendID, remark) => {
    set((state) => {
      const { friends } = state.friendStore;
      const friend = friends.find((item) => item.id === friendID);
      if (!friend) {
        return state;
      }
      friend.remark = remark;
      return { friendStore: { friends } };
    });
  },
});

export default createFriendSlice;
