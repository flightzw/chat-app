import { useMemo, useState } from 'react';
import { Avatar, Card, Descriptions, Empty, Input, List, Modal } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';

import { friendApi } from '@/api';

import './index.scss';

type OpenChatModalProps = {
  open: boolean;
  users: friendApi.FriendInfo[];
  onSubmit: (user: friendApi.FriendInfo) => void;
  onCancel: () => void;
};

const cardActions = [
  { key: 'confirm', title: '发消息' },
  { key: 'cancel', title: '取消' },
];

export default function OpenChatModal(props: OpenChatModalProps) {
  const [selectItem, setSelectItem] = useState<friendApi.FriendInfo | null>(null);
  const [searchText, setSearchText] = useState('');
  const userList = useMemo(
    () =>
      props.users.filter((item) => item.nickname.search(searchText) !== -1 || item.remark.search(searchText) !== -1),
    [props.users, searchText]
  );
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
            <Input
              placeholder="搜索"
              prefix={<SearchOutlined />}
              maxLength={20}
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <List
            className="modal-sidebar-list"
            dataSource={userList}
            renderItem={(item) => {
              return (
                <div
                  className="modal-sidebar-listitem no-select"
                  style={selectItem === item ? { backgroundColor: '#C8C6C5' } : undefined}
                  onClick={() => {
                    setSelectItem(item);
                    setSearchText('');
                  }}
                >
                  <Avatar shape="square" src={item.avatar_url}>
                    {item.nickname.substring(0, 2)}
                  </Avatar>
                  <div>{item.remark || item.nickname}</div>
                </div>
              );
            }}
          ></List>
        </div>
        <div className="modal-content">
          <Card
            title="选择好友"
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
                    <Avatar shape="square" size={80} src={selectItem.avatar_url} icon={<UserOutlined />}>
                      头像
                    </Avatar>
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

function initDescItems(data: friendApi.FriendInfo) {
  return [
    { key: 'username', label: '用户名', children: data.username },
    { key: 'nickname', label: '昵称', children: data.nickname },
    { key: 'signature', label: '个性签名', children: data.signature },
    { key: 'remark', label: '备注', children: data.remark },
  ];
}
