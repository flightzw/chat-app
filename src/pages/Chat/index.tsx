import { useEffect, useRef, useState } from 'react';
import { Avatar, Badge, Button, Dropdown, Empty, Input, Layout, List, message, Space } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  DisconnectOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

import emoji from '@/utils/emoji';
import { useStore } from '@/store';
import { friendApi, msgApi, ws } from '@/api';
import { ChatBox, OpenChatModal } from '@/components';
import { useChatList, useChatListMenu, useChatMembers } from './hooks';

import './index.scss';
import { newChatInfoByFriend } from '@/store/chat';
import days from '@/utils/days';
import errors from '@/utils/errors';
import strings from '@/utils/strings';

export default function Chat() {
  const boxRef = useRef<HTMLElement>(null);
  const [searchText, setSearchText] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [listHeight, setListHeight] = useState(631);

  const user = useStore((state) => state.user);
  const { friends } = useStore((state) => state.friendStore);
  const { chats, activeChat, connStat } = useStore((state) => state.chatStore);

  const openChat = useStore((state) => state.openChat);
  const setActiveChat = useStore((state) => state.setActiveChat);
  const insertMessage = useStore((state) => state.insertMessage);
  const setActiveChatDraft = useStore((state) => state.setActiveChatDraft);

  const members = useChatMembers(user, friends, activeChat);
  const chatList = useChatList(chats, searchText, friends);
  const chatsMenu = useChatListMenu();

  // 切换活跃聊天窗口时，若存在未读消息，自动已读
  useEffect(() => {
    if (activeChat && activeChat.getUnreadCount() > 0) {
      msgApi.readedPrivateMessage(activeChat.id).catch((err) => console.error('msgApi.readedPrivateMessage', err));
    }
    setListHeight(boxRef.current!.clientHeight);
  }, [activeChat]);

  const handleChatListItemClick = (idx: number) => {
    setActiveChat(idx);
    setSearchText('');
  };

  const handleTextMsgSubmit = async (text: string) => {
    if (!activeChat) {
      return;
    }
    if (text === '') {
      message.warning('消息内容不得为空');
      return;
    }
    try {
      const { data } = await msgApi.sendPrivateMessage({
        type: msgApi.MessageType.Text,
        recv_id: activeChat.id,
        content: text,
      });
      if (activeChat.getUnreadCount() > 0) {
        msgApi.readedPrivateMessage(activeChat.id);
      }
      insertMessage(activeChat.id, data);
      setActiveChatDraft({ text: '', count: 0 });
    } catch (err) {
      errors.showHttpErrorMessageTips(err);
    }
  };

  const handleOpenChatSubmit = (data: friendApi.FriendInfo) => {
    openChat(newChatInfoByFriend(user.id, data), true);
    setOpenModal(false);
  };
  return (
    <>
      <Layout className="chatpage-container">
        <Layout.Sider className="chatpage-sidebar" style={{ backgroundColor: '#E4E4E4' }} width={300}>
          <div className="chatpage-sidebar-top">
            <Space>
              <Input
                placeholder="搜索"
                prefix={<SearchOutlined />}
                allowClear
                maxLength={30}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button
                className="chatpage-sidebar-top-btn"
                icon={<PlusOutlined />}
                title="创建聊天"
                onClick={() => setOpenModal(true)}
              />
            </Space>
          </div>
          <div className="chatpage-sidebar-list no-select">
            <div
              className="chatpage-sidebar-status"
              style={{ backgroundColor: connStat === ws.ConnStatus.Connected ? '#ee7959' : 'red' }}
            >
              {ConnStatusBar(connStat)}
            </div>
            <List
              split={false}
              bordered={false}
              dataSource={chatList}
              renderItem={(item, idx) => {
                const useDraft = activeChat !== item && item.draft.count > 0;
                return (
                  <Dropdown
                    trigger={['contextMenu']}
                    menu={{ items: chatsMenu.items, onClick: chatsMenu.makeClickFunc(item) }}
                  >
                    <List.Item
                      className="chatpage-sidebar-listitem"
                      style={activeChat === item ? { backgroundColor: '#C8C6C5' } : undefined}
                      onClick={() => handleChatListItemClick(idx)}
                    >
                      <Badge count={item.getUnreadCount()} offset={[-5, 5]} size="small">
                        <Avatar size={44} src={item.avatarUrl || undefined}>
                          {item.name.substring(0, 2)}
                        </Avatar>
                      </Badge>
                      <div className="listitem-body">
                        <div className="listitem-header">
                          <span>{item.name}</span>
                          <span className="listitem-header-time">{days.formatSendTime(item.getLastSendTime())}</span>
                        </div>
                        <div className="listitem-content">
                          {useDraft && <div style={{ color: 'red' }}>[草稿]</div>}
                          <div
                            className="listitem-lastmsg"
                            dangerouslySetInnerHTML={{
                              __html: emoji.replaceEmojiTag(
                                strings.latestMsgFilter.process(useDraft ? item.draft.text : item.getLastContent())
                              ),
                            }}
                          />
                        </div>
                      </div>
                    </List.Item>
                  </Dropdown>
                );
              }}
            />
          </div>
        </Layout.Sider>
        <Layout className="chatpage-body" style={{ width: '100%' }}>
          <Layout.Header className="chatpage-body-header">{activeChat ? activeChat.name : '未选择会话'}</Layout.Header>
          <Layout.Content
            className="chatpage-body-content"
            ref={boxRef}
            onResize={() => setListHeight(boxRef.current!.clientHeight)}
          >
            {activeChat ? (
              <ChatBox
                chat={activeChat}
                messages={[...activeChat.getMessages()]}
                members={members}
                height={listHeight}
                maxInputCount={200}
                onInputChange={setActiveChatDraft}
                onInputSubmit={handleTextMsgSubmit}
              />
            ) : (
              <Empty className="chatpage-empty-content" />
            )}
          </Layout.Content>
        </Layout>
      </Layout>
      <OpenChatModal
        open={openModal}
        users={friends}
        onSubmit={handleOpenChatSubmit}
        onCancel={() => setOpenModal(false)}
      />
    </>
  );
}

function ConnStatusBar(status: ws.ConnStatus) {
  switch (status) {
    case ws.ConnStatus.Connected:
      return (
        <div>
          <CheckCircleOutlined />
          <span>已连接至服务器</span>
        </div>
      );
    case ws.ConnStatus.Reconnecting:
      return (
        <div>
          <LoadingOutlined />
          <span>正在重连...</span>
        </div>
      );
    default:
      return (
        <div>
          <DisconnectOutlined />
          <span>连接已断开</span>
        </div>
      );
  }
}
