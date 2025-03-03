import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '@/store/auth';

export default function AuthRoute({ children }: { children: React.ReactNode }) {
  if (getToken()) {
    return <>{children}</>;
  }
  return <Navigate to="/login" replace />;
}
