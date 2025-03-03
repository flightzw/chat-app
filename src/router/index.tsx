import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AuthRoute } from '@/components';

import Login from '@/pages/Login';
import Layout from '@/pages/Layout';
import Chat from '@/pages/Chat';
import Friend from '@/pages/Friend';
import Setting from '@/pages/Setting';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Navigate to={'/login'} replace={true} />,
    },
    {
      path: 'login',
      element: <Login />,
    },
    {
      path: 'home',
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
      element: <div>404 Not Found</div>,
    },
  ],
  { future: { v7_relativeSplatPath: true } }
);
export default router;
