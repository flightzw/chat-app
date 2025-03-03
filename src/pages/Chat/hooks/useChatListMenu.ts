import { useStore } from '@/store';
import { ChatInfo } from '@/store/chat/chat';

export function useChatListMenu() {
  const removeChat = useStore((state) => state.removeChat);
  const chatListMenu = {
    items: [{ key: 'del-chat', label: '删除聊天' }],
    makeClickFunc: (chat: ChatInfo) => {
      return ({ key }: { key: string }) => {
        switch (key) {
          case 'del-chat':
            return removeChat(chat.id);
          default:
            console.warn('[useChatListMenu]: invalid menu key:', key);
        }
      };
    },
  };
  return chatListMenu;
}
