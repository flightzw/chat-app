import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import * as auth from './auth';
import createUserSlice, { UserState } from './user';
import createFriendSlice, { FriendState } from './friend';
import createChatSlice, { ChatState } from './chat';

type AppState = UserState & FriendState & ChatState;

const useStore = create<AppState>()(
  devtools((...a) => ({
    ...createUserSlice(...a),
    ...createFriendSlice(...a),
    ...createChatSlice(...a),
  }))
);
export { useStore, auth };
