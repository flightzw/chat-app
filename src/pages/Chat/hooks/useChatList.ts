import { friendApi } from '@/api';
import { ChatInfo } from '@/store/chat/chat';
import { useMemo } from 'react';

// 获取会话列表
export function useChatList(allChats: ChatInfo[], searchText: string, friends: friendApi.FriendInfo[]) {
  const friendMap = useMemo(() => new Map(friends.map((item) => [item.id, item])), [friends]);

  const chatList = useMemo(() => {
    const chats = allChats.map((chat) => {
      const friend = friendMap.get(chat.id);
      if (friend) {
        chat.avatarUrl = friend.avatar_url;
        chat.name = friend.remark || friend.nickname;
      }
      return chat;
    });
    return searchText === '' ? chats : chats.filter((chat) => chat.name.search(searchText) != -1);
  }, [allChats, searchText, friendMap]);
  return chatList;
}
