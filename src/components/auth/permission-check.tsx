import React from 'react';
import { usePermission } from '@/src/hooks/use-permission';

interface PermissionCheckProps {
  requiredPermissions: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionCheck({
  requiredPermissions,
  children,
  fallback = null,
}: PermissionCheckProps) {
  const hasPermission = usePermission(requiredPermissions);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// 便利なラッパーコンポーネント
export function ShiftManagementCheck({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <PermissionCheck
      requiredPermissions={['SHIFT_MANAGEMENT']}
      fallback={fallback}
    >
      {children}
    </PermissionCheck>
  );
}

export function AttendanceManagementCheck({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <PermissionCheck
      requiredPermissions={['ATTENDANCE_MANAGEMENT']}
      fallback={fallback}
    >
      {children}
    </PermissionCheck>
  );
}

export function SystemSettingsCheck({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <PermissionCheck
      requiredPermissions={['SYSTEM_SETTINGS']}
      fallback={fallback}
    >
      {children}
    </PermissionCheck>
  );
}

export function UserManagementCheck({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <PermissionCheck
      requiredPermissions={['USER_MANAGEMENT']}
      fallback={fallback}
    >
      {children}
    </PermissionCheck>
  );
}
