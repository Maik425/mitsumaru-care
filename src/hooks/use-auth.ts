'use client';

// 新しい認証システムを使用するための再エクスポート
export { useAuth } from '@/components/auth/auth-provider';

// 後方互換性のため、useAuthContextもエクスポート
export { useAuth as useAuthContext } from '@/components/auth/auth-provider';
