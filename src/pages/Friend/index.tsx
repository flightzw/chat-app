import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Empty,
  Input,
  InputRef,
  Layout,
  List,
  message,
  Popconfirm,
  Space,
} from 'antd';
import { SearchOutlined, UserAddOutlined, SendOutlined, UserDeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { useStore } from '@/store';
import { friendApi, userApi } from '@/api';

import './index.scss';

import AddFriendModal from '@/components/AddFriendModal';
import { newChatInfoByFriend } from '@/store/chat';
import errors from '@/utils/errors';

export default function Friend() {
  const navigate = useNavigate();

  const user = useStore((state) => state.user);
  const friendStore = useStore((state) => state.friendStore);
  const fetchFriendInfo = useStore((state) => state.fetchFriendInfo);
  const setFriendRemark = useStore((state) => state.setFriendRemark);
  const openChat = useStore((state) => state.openChat);

  const [selectFriend, setSelectFriend] = useState<friendApi.FriendInfo | null>(null);
  const [searchText, setSearchText] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [newRemark, setNewRemark] = useState('');

  const inputRef = useRef<InputRef>(null);

  const friendList = useMemo(
    () => friendStore.friends.filter((item) => item.nickname.search(searchText) !== -1),
    [friendStore, searchText]
  );

  useEffect(() => {
    fetchFriendInfo();
  }, [fetchFriendInfo]);

  useEffect(() => {
    if (selectFriend && showInput && inputRef.current) {
      setNewRemark(selectFriend.remark.trim());
      inputRef.current.focus({ cursor: 'end' });
    }
  }, [showInput, selectFriend, inputRef]);

  const handleSendMsgBtnClick = (friend: friendApi.FriendInfo) => {
    openChat(newChatInfoByFriend(user.id, friend), true);
    navigate('/home/chat');
  };

  const handleAddFriend = async (user: userApi.UserInfo) => {
    try {
      await friendApi.addFriend(user.id);
      await fetchFriendInfo();
      message.success('添加成功');
    } catch (err) {
      errors.showHttpErrorMessageTips(err);
    }
  };

  const updateFriendRemark = async () => {
    if (!selectFriend || !inputRef.current) {
      return;
    }
    try {
      if (selectFriend.remark === newRemark) {
        return;
      }
      await friendApi.updateFriend(selectFriend.id, newRemark);
      setFriendRemark(selectFriend.id, newRemark);
    } catch (err) {
      errors.showHttpErrorMessageTips(err);
    } finally {
      setShowInput(false);
    }
  };
  const deleteFriend = async (id: number) => {
    if (!id) {
      return;
    }
    try {
      await friendApi.removeFriend(id);
      message.info('删除成功');
      fetchFriendInfo();
    } catch (err) {
      errors.showHttpErrorMessageTips(err);
    }
  };
  return (
    <>
      <Layout className="friendpage-container">
        <Layout.Sider className="friendpage-sidebar" width={300}>
          <div className="friendpage-sidebar-top">
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
                className="friendpage-sidebar-top-btn"
                icon={<UserAddOutlined />}
                title="添加好友"
                onClick={() => setOpenModal(true)}
              />
            </Space>
          </div>
          <div className="friendpage-sidebar-list no-select">
            <List
              split={false}
              dataSource={friendList}
              renderItem={(item) => {
                return (
                  <List.Item
                    className="friendpage-sidebar-listitem"
                    style={selectFriend === item ? { backgroundColor: '#C8C6C5' } : undefined}
                    onClick={() => {
                      setSelectFriend(item);
                      setSearchText('');
                    }}
                  >
                    <div>
                      <Avatar size={44} src={item.avatar_url !== '' && item.avatar_url}>
                        {(item.remark && item.remark.substring(0, 2)) || item.nickname.substring(0, 2)}
                      </Avatar>
                    </div>
                    <div className="listitem-body">
                      <div>{item.remark || item.nickname}</div>
                      <div className={`listitem-body-desc`} style={item.is_online ? { color: 'red' } : undefined}>
                        [{item.is_online ? '在线' : '离线'}]{item.signature}
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          </div>
        </Layout.Sider>
        <Layout className="friendpage-body" style={{ width: '100%' }}>
          <Layout.Header className="friendpage-body-header">
            {selectFriend ? selectFriend.nickname : '选择好友'}
          </Layout.Header>
          <Layout.Content className="friendpage-body-content">
            <div className="friendpage-card" style={selectFriend ? undefined : { display: 'none' }}>
              <Card
                actions={[
                  <div
                    className="friendpage-card-action"
                    onClick={() => selectFriend && handleSendMsgBtnClick(selectFriend)}
                  >
                    <SendOutlined />
                    <div>发消息</div>
                  </div>,
                  <Popconfirm
                    title="删除确认"
                    description="删除后将无法接收对方消息，是否继续？"
                    onConfirm={() => deleteFriend(selectFriend ? selectFriend.id : 0)}
                  >
                    <div className="friendpage-card-action">
                      <UserDeleteOutlined />
                      <div>删除好友</div>
                    </div>
                  </Popconfirm>,
                ]}
              >
                <div className="friendpage-card-top">
                  <div>
                    <Avatar shape="square" size={80} src={selectFriend && selectFriend.avatar_url}>
                      {selectFriend?.nickname.substring(0, 2)}
                    </Avatar>
                  </div>
                  <div className="friendpage-card-nameinfo">
                    <div style={{ fontSize: 18 }}>{selectFriend?.username}</div>
                    <div style={{ color: '#9E9E9E' }}>昵称：{selectFriend?.nickname}</div>
                  </div>
                </div>
                <Descriptions
                  className="friendpage-card-table"
                  colon={false}
                  items={[
                    {
                      label: '个性签名',
                      span: 3,
                      children: <div className="friendpage-card-signature">{selectFriend?.signature}</div>,
                    },
                    {
                      label: '备注',
                      span: 3,
                      children: (
                        <>
                          <div style={showInput ? { display: 'none' } : undefined}>
                            {selectFriend?.remark || (
                              <Button type="link" onClick={() => setShowInput(true)}>
                                点击添加备注
                              </Button>
                            )}
                          </div>
                          <Input
                            style={!showInput ? { display: 'none' } : undefined}
                            ref={inputRef}
                            maxLength={10}
                            showCount
                            allowClear
                            value={newRemark}
                            onChange={(e) => setNewRemark(e.target.value.trim())}
                            onPressEnter={() => updateFriendRemark()}
                            onBlur={() => updateFriendRemark()}
                          />
                          <Button
                            title="更改备注"
                            style={selectFriend?.remark && !showInput ? undefined : { display: 'none' }}
                            icon={<EditOutlined />}
                            onClick={() => setShowInput(true)}
                          />
                        </>
                      ),
                    },
                  ]}
                />
              </Card>
            </div>
            <Empty className="friendpage-empty-content" style={!selectFriend ? {} : { display: 'none' }} />
          </Layout.Content>
        </Layout>
      </Layout>
      <AddFriendModal open={openModal} onSubmit={handleAddFriend} onCancel={() => setOpenModal(false)} />
    </>
  );
}
