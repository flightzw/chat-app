import dayjs from 'dayjs';
import { Card } from 'antd';
import { useRef, useState } from 'react';

import { LoginForm, RegisterForm } from '@/components';

import './index.scss';
import img01 from '@/assets/images/01.jpg';
import img02 from '@/assets/images/02.jpg';
import img03 from '@/assets/images/03.jpg';
import img04 from '@/assets/images/04.jpg';
import img05 from '@/assets/images/05.jpg';

const bgImages = [img01, img02, img03, img04, img05];

export default function Login() {
  const image = useRef(bgImages[dayjs().second() % 5]);

  const [activeTabKey, setActiveTabKey] = useState('login');
  return (
    <div className="login-container" style={{ backgroundImage: `url(${image.current})` }}>
      <Card
        className="login-card"
        title={<div>Chat Demo</div>}
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
