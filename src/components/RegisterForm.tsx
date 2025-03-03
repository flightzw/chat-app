import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, Checkbox, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

import { userApi } from '@/api';
import { saveTokenInfo } from '@/store/auth';
import errors from '@/utils/errors';

export default function RegisterForm() {
  const navigate = useNavigate();
  const [fastLogin, setFastLogin] = useState(true);
  const handleFinish = async (info: userApi.RegisterInfo) => {
    try {
      await userApi.register(info);
      message.success('注册成功');
      if (!fastLogin) {
        return;
      }
      const { data } = await userApi.login({
        username: info.username,
        password: info.password,
      });
      saveTokenInfo(data.token, data.refresh_token);
      navigate('/home');
    } catch (err) {
      errors.showHttpErrorMessageTips(err);
    }
  };

  return (
    <Form onFinish={handleFinish}>
      <Form.Item
        name="username"
        rules={[
          { required: true, message: '用户名为必填项' },
          { min: 6, max: 20, message: '用户名长度必须在6-20个字符之间' },
          { pattern: /^[a-zA-Z0-9]+$/, message: '用户名仅允许包含字母或数字' },
        ]}
      >
        <Input prefix={<UserOutlined />} placeholder="用户名（字母/数字）" />
      </Form.Item>
      <Form.Item
        name="nickname"
        rules={[
          { required: true, message: '昵称为必填项' },
          { min: 2, max: 10, message: '昵称长度必须在2-10个字符之间' },
          { pattern: /^\S*$/, message: '昵称不得包含空白字符' },
        ]}
      >
        <Input prefix={<UserOutlined />} placeholder="昵称" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          { required: true, message: '密码为必填项' },
          { min: 10, max: 20, message: '密码长度必须在10-20个字符之间' },
          {
            pattern: /^[a-zA-Z0-9!@#$%^&*]+$/,
            message: '密码仅允许包含字母/数字或字符：!@#$%^&*',
          },
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="密码（字母/数字或字符：!@#$%^&*）" />
      </Form.Item>
      <Form.Item
        name="confirm_password"
        dependencies={['password']}
        rules={[
          { required: true, message: '密码需二次确认' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('二次确认输入的密码与原密码不匹配'));
            },
          }),
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
      </Form.Item>
      <Form.Item>
        <Checkbox style={{ paddingBottom: 5 }} checked={fastLogin} onChange={() => setFastLogin(!fastLogin)}>
          注册后登录
        </Checkbox>
        <Button block type="primary" htmlType="submit">
          注册
        </Button>
      </Form.Item>
    </Form>
  );
}
