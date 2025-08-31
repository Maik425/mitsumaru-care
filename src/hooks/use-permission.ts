import { useMemo } from 'react';
import { useAuth } from './use-auth';

export const usePermission = (requiredPermissions: string[]) => {
  const { user, hasPermission } = useAuth();

  const canAccess = useMemo(() => {
    if (!user) return false;
    return hasPermission(requiredPermissions);
  }, [user, hasPermission, requiredPermissions]);

  return canAccess;
};
