'use client';

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * RoleGuard component - Only renders children if the current user has one of the allowed roles
 *
 * @example
 * <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
 *   <AdminOnlyComponent />
 * </RoleGuard>
 */
export default function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { data: session, status } = useSession();
  const userRole = session?.user?.role as UserRole;

  // While loading, show nothing
  if (status === 'loading') {
    return null;
  }

  // If not authenticated or doesn't have required role, show fallback
  if (!session || !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  // User has required role, show children
  return <>{children}</>;
}
