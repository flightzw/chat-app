import ReactDOM from 'react-dom/client';
import dayjs from 'dayjs';
import zhCN from 'antd/es/locale/zh_CN';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';

import 'dayjs/locale/zh-cn';
import './index.css';
import router from '@/router';
import localforage from 'localforage';

dayjs.locale('zh-CN');

localforage.config({
  name: import.meta.env.VITE_APP_NAME,
  size: 5 * 1024 * 1024, // 5MB
  storeName: import.meta.env.VITE_APP_NAME,
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  // <React.StrictMode>
  <ConfigProvider locale={zhCN} wave={{ disabled: true }}>
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  </ConfigProvider>
);
