import { Card } from 'antd';
import { useState } from 'react';

import { LoginForm, RegisterForm } from '@/components';

import './index.scss';

export default function Login() {
  const [activeTabKey, setActiveTabKey] = useState('login');
  return (
    <div className="login-container">
      <Card
        className="login-card"
        title={
          <div
            style={{ fontSize: 24, textAlign: 'center', fontWeight: 'bold' }}
          >
            Chat Demo
          </div>
        }
        style={{ width: '360px' }}
        tabList={[
          { key: 'login', label: '登录' },
          { key: 'register', label: '注册' },
        ]}
        activeTabKey={activeTabKey}
        onTabChange={(key) => setActiveTabKey(key)}
        tabProps={{
          size: 'large',
          centered: true,
          tabBarGutter: 100,
          indicator: { size: 120, align: 'center' },
        }}
      >
        {activeTabKey == 'login' ? <LoginForm /> : <RegisterForm />}
      </Card>
    </div>
  );
}
