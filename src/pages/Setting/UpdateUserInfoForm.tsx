import { Button, Form, Input, Radio } from 'antd';
import { BsGenderMale, BsGenderFemale } from 'react-icons/bs';

import { userApi } from '@/api';
import { useEffect, useState } from 'react';

type UpdateUserInfoFormProps = {
  className?: string;
  user: userApi.UserInfo;
  onSubmit: (data: userApi.UpdateUserForm) => void;
};

export default function UpdateUserInfoForm(props: UpdateUserInfoFormProps) {
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(props.user);
  }, [form, props.user]);

  const trimFormItemString = (field: string, value: string) => {
    form.setFieldValue(field, value.trim());
  };
  return (
    <Form
      className={props.className}
      form={form}
      initialValues={props.user}
      layout="vertical"
      size="large"
      onFinish={(data) => {
        setLoading(true);
        props.onSubmit(data);
        setTimeout(() => setLoading(false), 1000);
      }}
    >
      <Form.Item label="昵称" name="nickname" rules={[{ required: true, message: '昵称为必填项' }]}>
        <Input maxLength={10} showCount onBlur={(e) => trimFormItemString('nickname', e.target.value)} />
      </Form.Item>
      <Form.Item label="性别" name="gender">
        <Radio.Group block optionType="button" buttonStyle="solid">
          <Radio.Button value={1}>
            <div className="form-radio-btn">
              <BsGenderMale />男
            </div>
          </Radio.Button>
          <Radio.Button value={2}>
            <div className="form-radio-btn">
              <BsGenderFemale />女
            </div>
          </Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="个性签名" name="signature">
        <Input.TextArea
          allowClear
          showCount
          maxLength={200}
          autoSize={{ minRows: 4, maxRows: 4 }}
          onBlur={(e) => trimFormItemString('signature', e.target.value)}
        />
      </Form.Item>
      <Form.Item className="form-submit-btn">
        <Button type="primary" htmlType="submit" loading={loading}>
          保存
        </Button>
      </Form.Item>
    </Form>
  );
}
