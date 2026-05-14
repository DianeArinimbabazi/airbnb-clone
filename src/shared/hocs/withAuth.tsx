import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";

export function withAuth<P extends object>(Component: React.ComponentType<P>): React.ComponentType<P> {
  return function AuthGuard(props: P): React.ReactElement {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <Component {...props} />;
  };
}
