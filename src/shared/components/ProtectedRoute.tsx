 import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../features/auth/hooks/useAuth';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    toast.error('Please log in to access this page');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
} 
