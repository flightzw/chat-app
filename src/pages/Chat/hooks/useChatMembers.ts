import { useMemo } from 'react';

import { friendApi, userApi } from '@/api';
import { ChatMember } from '@/components/Chat/model';
import { ChatInfo } from '@/store/chat';

export function useChatMembers(
  self: userApi.UserInfo,
  friends: friendApi.FriendInfo[],
  activeChat?: ChatInfo
): ChatMember[] {
  return useMemo(() => {
    if (!activeChat) {
      return [];
    }
    const friend = friends.find((item) => item.id === activeChat.id);
    const members: ChatMember[] = [{ id: self.id, nickname: self.nickname, avatarUrl: self.avatar_url }];
    if (!friend) {
      members.push({
        id: activeChat.id,
        nickname: activeChat.name,
        avatarUrl: activeChat.avatarUrl,
      });
    } else {
      members.push({
        id: friend.id,
        nickname: friend.remark || friend.nickname,
        avatarUrl: friend.avatar_url,
      });
    }
    return members;
  }, [self, friends, activeChat]);
}
