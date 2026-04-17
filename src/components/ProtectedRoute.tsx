import { useAuthStore } from '../store/auth';
import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token } = useAuthStore();

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
