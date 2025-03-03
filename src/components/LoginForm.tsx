import { Button, Checkbox, Form, Flex, Input } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { userApi } from '@/api';
import { saveTokenInfo } from '@/store/auth';
import errors from '@/utils/errors';

export default function LoginForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleFinish = async (info: userApi.LoginInfo) => {
    try {
      setLoading(true);
      const { data } = await userApi.login(info);
      // 存储 token, 页面跳转
      saveTokenInfo(data.token, data.refresh_token);
      navigate('/home');
    } catch (err) {
      errors.showHttpErrorMessageTips(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Form
      name="login"
      initialValues={{ remember_me: true }}
      style={{ maxWidth: 360 }}
      size="large"
      onFinish={handleFinish}
    >
      <Form.Item
        name="username"
        rules={[
          { required: true, message: '用户名为必填项' },
          { min: 6, max: 20, message: '用户名长度必须在6-20个字符之间' },
          { pattern: /^[a-zA-Z0-9]+$/, message: '用户名仅允许包含字母或数字' },
        ]}
      >
        <Input prefix={<UserOutlined />} placeholder="用户名" />
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
        <Input.Password prefix={<LockOutlined />} placeholder="密码" />
      </Form.Item>
      <Form.Item>
        <Flex justify="space-between" align="center">
          <Form.Item name="remember_me" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
        </Flex>
      </Form.Item>
      <Form.Item>
        <Button block type="primary" htmlType="submit" loading={loading}>
          登录
        </Button>
      </Form.Item>
    </Form>
  );
}
