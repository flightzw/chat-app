import { Button, Form, Input } from 'antd';
import { useState } from 'react';
import { LockOutlined } from '@ant-design/icons';

import { userApi } from '@/api';

type UpdatePasswordFormProps = {
  className?: string;
  onSubmit: (data: userApi.UpdatePasswordForm) => void;
};

export default function UpdatePasswordForm(props: UpdatePasswordFormProps) {
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const trimFormItemString = (field: string, value: string) => {
    form.setFieldValue(field, value.trim());
  };
  return (
    <Form
      className={props.className}
      form={form}
      layout="vertical"
      size="large"
      onFinish={(data) => {
        setLoading(true);
        props.onSubmit(data);
        setTimeout(() => setLoading(false), 1000);
      }}
    >
      <Form.Item
        label="旧密码"
        name="old_password"
        rules={[
          { required: true, message: '旧密码为必填项' },
          { min: 10, max: 20, message: '密码长度必须在10-20个字符之间' },
          {
            pattern: /^[a-zA-Z0-9!@#$%^&*]+$/,
            message: '密码仅允许包含字母/数字或字符：!@#$%^&*',
          },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="密码（字母/数字或字符：!@#$%^&*）"
          onBlur={(e) => trimFormItemString('old_password', e.target.value)}
        />
      </Form.Item>
      <Form.Item
        label="新密码"
        name="new_password"
        rules={[
          { required: true, message: '新密码为必填项' },
          { min: 10, max: 20, message: '密码长度必须在10-20个字符之间' },
          {
            pattern: /^[a-zA-Z0-9!@#$%^&*]+$/,
            message: '密码仅允许包含字母/数字或字符：!@#$%^&*',
          },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="密码（字母/数字或字符：!@#$%^&*）"
          onBlur={(e) => trimFormItemString('new_password', e.target.value)}
        />
      </Form.Item>
      <Form.Item
        label="确认密码"
        name="confirm_password"
        dependencies={['new_password']}
        rules={[
          { required: true, message: '新密码需二次确认' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('new_password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('二次确认输入的密码与新密码不匹配'));
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="密码（字母/数字或字符：!@#$%^&*）"
          onBlur={(e) => trimFormItemString('confirm_password', e.target.value)}
        />
      </Form.Item>
      <Form.Item className="form-submit-btn">
        <Button type="primary" danger htmlType="submit" loading={loading}>
          确定
        </Button>
      </Form.Item>
    </Form>
  );
}
