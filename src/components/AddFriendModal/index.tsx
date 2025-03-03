import { Avatar, Card, Descriptions, Empty, Input, List, Modal } from 'antd';
import { useState } from 'react';
import { UserOutlined } from '@ant-design/icons';

import { userApi } from '@/api';

import './index.scss';
import errors from '@/utils/errors';

type AddFriendModalProps = {
  open: boolean;
  onSubmit: (user: userApi.UserInfo) => void;
  onCancel: () => void;
};

const cardActions = [
  { key: 'confirm', title: '添加好友' },
  { key: 'cancel', title: '取消' },
];

export default function AddFriendModal(props: AddFriendModalProps) {
  const [userList, setUserList] = useState<userApi.UserInfo[]>([]);
  const [selectItem, setSelectItem] = useState<userApi.UserInfo | null>(null);

  const handleSearch = async (text: string) => {
    if (!text) {
      return;
    }
    try {
      const { data } = await userApi.listUserInfo(text);
      setUserList(data);
    } catch (err) {
      errors.showHttpErrorMessageTips(err);
    }
  };
  const handleCardActionClick = (key: string) => {
    switch (key) {
      case 'confirm':
        if (!selectItem) {
          return;
        }
        props.onSubmit(selectItem);
        break;
      case 'cancel':
        props.onCancel();
        break;
      default:
    }
    setSelectItem(null);
  };

  return (
    <Modal open={props.open} closable={false} footer={null} width={600}>
      <div style={{ display: 'flex' }}>
        <div className="modal-sidebar">
          <div className="modal-sidebar-search">
            <Input.Search placeholder="按用户名/昵称搜索" maxLength={20} allowClear onSearch={handleSearch} />
          </div>
          <List
            className="modal-sidebar-list"
            dataSource={userList}
            renderItem={(item) => {
              return (
                <div
                  className="modal-sidebar-listitem no-select"
                  style={selectItem === item ? { backgroundColor: '#C8C6C5' } : undefined}
                  onClick={() => setSelectItem(item)}
                >
                  <Avatar shape="square" src={item.avatar_url !== '' && item.avatar_url}>
                    {item.nickname.substring(0, 2)}
                  </Avatar>
                  <div>{item.nickname}</div>
                </div>
              );
            }}
          ></List>
        </div>
        <div className="modal-content">
          <Card
            title="选择用户"
            actions={cardActions.map((item) => (
              <div key={item.key} onClick={() => handleCardActionClick(item.key)}>
                {item.title}
              </div>
            ))}
          >
            <div>
              {selectItem ? (
                <>
                  <div className="modal-content-avatar no-select">
                    <Avatar shape="square" size={80} src={selectItem.avatar_url} icon={<UserOutlined />} />
                  </div>
                  <Descriptions className="modal-content-table" column={1} items={initDescItems(selectItem)} />
                </>
              ) : (
                <Empty />
              )}
            </div>
          </Card>
        </div>
      </div>
    </Modal>
  );
}

function initDescItems(user: userApi.UserInfo) {
  return [
    { key: 'username', label: '用户名', children: user.username },
    { key: 'nickname', label: '昵称', children: user.nickname },
    { key: 'signature', label: '个性签名', children: user.signature },
  ];
}
