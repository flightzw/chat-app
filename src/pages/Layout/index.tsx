import { useEffect, useMemo, useState } from 'react';
import { Avatar, Badge, Button } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogoutOutlined, MenuOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons';

import { useStore } from '@/store';
import { useChatConn } from '@/hooks';
import { LogoutConfirmModal } from '@/components';

import './index.scss';
import { clearTokenInfo } from '@/store/auth';

const maxReconnNum = import.meta.env.VITE_CONN_RETRY_NUM;

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [openModal, setOpenModal] = useState(false);

  const user = useStore((state) => state.user);
  const chatStore = useStore((state) => state.chatStore);
  const clearChatData = useStore((state) => state.clearChatData);
  const setConnStatus = useStore((state) => state.setConnStatus);
  const unreadMsgCount = useMemo(
    () => chatStore.chats.reduce((prev, chat) => prev + chat.getUnreadCount(), 0),
    [chatStore]
  );

  const selectKey = useMemo(() => location.pathname, [location]);
  const connStat = useChatConn(user.id, maxReconnNum);

  useEffect(() => {
    setConnStatus(connStat);
  }, [connStat, setConnStatus]);

  const handleMenuClick = (key: string) => {
    navigate(key);
  };
  const logout = async (clear: boolean) => {
    if (clear) {
      await clearChatData(user.id);
    }
    clearTokenInfo();
    navigate('/login', { replace: true });
    window.location.reload();
  };

  return (
    <>
      <div className="chatapp-container">
        <div className="chatapp-layout-sidebar">
          <div>
            <div className="chatapp-layout-avatar">
              <Button type="link" onClick={() => navigate('/home/setting')}>
                <Avatar shape="square" size={48} src={user.avatar_url !== '' && user.avatar_url}>
                  {user.nickname.substring(0, 2)}
                </Avatar>
              </Button>
            </div>
            <div className="chatapp-layout-menu">
              <div className="chatapp-layout-menuitem">
                <Button type="link" title="聊天" onClick={() => handleMenuClick('/home/chat')}>
                  <Badge count={unreadMsgCount} offset={[-20, 20]}>
                    <MessageOutlined
                      className="chatapp-layout-icon"
                      style={selectKey === '/home/chat' ? { color: '#07C160' } : undefined}
                    />
                  </Badge>
                </Button>
              </div>
              <div className="chatapp-layout-menuitem">
                <Button type="link" title="好友" onClick={() => handleMenuClick('/home/friend')}>
                  <UserOutlined
                    className="chatapp-layout-icon"
                    style={selectKey === '/home/friend' ? { color: '#07C160' } : undefined}
                  />
                </Button>
              </div>
            </div>
          </div>
          <div className="chatapp-sidebar-bottom">
            <div>
              <Button type="link" title={'设置'} onClick={() => navigate('/home/setting')}>
                <MenuOutlined style={selectKey === '/home/setting' ? { color: '#07C160' } : undefined} />
              </Button>
            </div>
            <div>
              <Button type="link" title={'退出登录'} onClick={() => setOpenModal(true)}>
                <LogoutOutlined />
              </Button>
            </div>
          </div>
        </div>
        <div className="chatapp-layout-container">
          <Outlet />
        </div>
      </div>
      <LogoutConfirmModal open={openModal} onCancel={() => setOpenModal(false)} onExit={logout} />
    </>
  );
}
