import { friendApi } from '@/api';
import { StateCreator } from 'zustand';

export interface FriendState {
  friendStore: { friends: friendApi.FriendInfo[] };
  fetchFriendInfo: () => Promise<void>;
  appendFriend: (friend: friendApi.FriendInfo) => void;
  setFriendRemark: (friendID: number, remark: string) => void;
}

const createFriendSlice: StateCreator<FriendState> = (set) => ({
  friendStore: { friends: [] },
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
