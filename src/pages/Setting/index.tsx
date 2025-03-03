import { Avatar, Button, Card, ConfigProvider, Divider, List, message, ThemeConfig } from 'antd';
import { EditOutlined, InfoCircleOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { useStore } from '@/store';
import { userApi } from '@/api';
import errors from '@/utils/errors';
import { clearTokenInfo } from '@/store/auth';

import UpdateUserInfoForm from './UpdateUserInfoForm';
import UpdatePasswordForm from './UpdatePasswordForm';
import './index.scss';

const theme: ThemeConfig = {
  components: {},
};

const actionList = [
  { key: 'userinfo', icon: <InfoCircleOutlined />, content: '个人信息' },
  { key: 'password', icon: <EditOutlined />, content: '修改密码' },
];

export default function Setting() {
  const [action, setAction] = useState('userinfo');

  const user = useStore((state) => state.user);
  const fetchUserInfo = useStore((state) => state.fetchUserInfo);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  const updateUserInfo = async (info: userApi.UpdateUserForm) => {
    if (user.nickname === info.nickname && user.gender === info.gender && user.signature === info.signature) {
      message.success('保存成功');
      return;
    }
    try {
      await userApi.updateUserInfo(info);
      fetchUserInfo();
      message.success('保存成功');
    } catch (err) {
      errors.showHttpErrorMessageTips(err);
    }
  };
  const updatePassword = async (info: userApi.UpdatePasswordForm) => {
    if (info.old_password === info.new_password) {
      message.warning('新旧密码不得相同');
      return;
    }
    try {
      await userApi.updatePassword(info);
      message.success('密码修改成功，需重新登录');
      setTimeout(() => {
        clearTokenInfo();
        navigate('/login', { replace: true });
        window.location.reload();
      }, 3000);
    } catch (err) {
      errors.showHttpErrorMessageTips(err);
    }
  };
  return (
    <ConfigProvider theme={theme}>
      <div className="settingpage-container">
        <div className="settingpage-box">
          <div className="settingpage-sidebar">
            <div className="settingpage-sidebar-userinfo">
              <Avatar
                style={{ backgroundColor: 'blue' }}
                shape="square"
                size={60}
                src={user.avatar_url || undefined}
                icon={<UserOutlined />}
              />
              <div>{user.nickname}</div>
            </div>
            <Divider className="no-select">操作</Divider>
            <List
              itemLayout="horizontal"
              dataSource={actionList}
              renderItem={(item) => (
                <List.Item>
                  <Button type="link" icon={item.icon} onClick={() => setAction(item.key)}>
                    {item.content}
                  </Button>
                </List.Item>
              )}
            />
          </div>
          <Card className="settingpage-card">
            <div className="settingpage-card-avatar">
              <Avatar
                style={{ backgroundColor: 'blue' }}
                size={100}
                src={user.avatar_url || undefined}
                icon={<UserOutlined />}
              />
            </div>
            {action === 'userinfo' && (
              <UpdateUserInfoForm className="settingpage-card-form" user={user} onSubmit={updateUserInfo} />
            )}
            {action === 'password' && (
              <UpdatePasswordForm className="settingpage-card-form" onSubmit={updatePassword} />
            )}
          </Card>
        </div>
      </div>
    </ConfigProvider>
  );
}
