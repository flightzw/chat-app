import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AuthRoute } from '@/components';

import Login from '@/pages/Login';
import Layout from '@/pages/Layout';
import Chat from '@/pages/Chat';
import Friend from '@/pages/Friend';
import Setting from '@/pages/Setting';
import NotFound from '@/pages/NotFound';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Navigate to={'/login'} replace={true} />,
    },
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/home',
      element: (
        <AuthRoute>
          <Layout />
        </AuthRoute>
      ),
      children: [
        {
          index: true,
          element: <Chat />,
        },
        {
          path: 'chat',
          element: <Chat />,
        },
        {
          path: 'friend',
          element: <Friend />,
        },
        {
          path: 'setting',
          element: <Setting />,
        },
      ],
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ],
  {
    future: { v7_relativeSplatPath: true },
    basename: `/${import.meta.env.VITE_APP_NAME}`,
  }
);
export default router;
