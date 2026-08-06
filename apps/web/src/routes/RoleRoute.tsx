import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Role } from '@tribhuvan/shared';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role as Role)) {
    const roleRedirects: Record<string, string> = {
      STUDENT: '/student',
      TEACHER: '/teacher',
      ADMIN: '/admin',
    };
    return <Navigate to={roleRedirects[user.role] || '/login'} replace />;
  }

  return <>{children}</>;
}
