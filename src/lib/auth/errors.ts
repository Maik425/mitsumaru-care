export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_INACTIVE: 'USER_INACTIVE',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

// エラーメッセージのマッピング
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]:
    'メールアドレスまたはパスワードが正しくありません',
  [AUTH_ERROR_CODES.USER_NOT_FOUND]: 'ユーザーが見つかりません',
  [AUTH_ERROR_CODES.USER_INACTIVE]: 'アカウントが無効化されています',
  [AUTH_ERROR_CODES.SESSION_EXPIRED]: 'セッションの有効期限が切れました',
  [AUTH_ERROR_CODES.NETWORK_ERROR]: 'ネットワークエラーが発生しました',
  [AUTH_ERROR_CODES.UNKNOWN_ERROR]: '不明なエラーが発生しました',
};

// エラーハンドリングユーティリティ
export function handleAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) {
    return error;
  }

  if (error instanceof Error) {
    // Supabaseエラーの処理
    if (error.message.includes('Invalid login credentials')) {
      return new AuthError(
        AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.INVALID_CREDENTIALS],
        AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        error
      );
    }

    if (error.message.includes('User not found')) {
      return new AuthError(
        AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.USER_NOT_FOUND],
        AUTH_ERROR_CODES.USER_NOT_FOUND,
        error
      );
    }

    // ネットワークエラーの処理
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return new AuthError(
        AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.NETWORK_ERROR],
        AUTH_ERROR_CODES.NETWORK_ERROR,
        error
      );
    }
  }

  return new AuthError(
    AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.UNKNOWN_ERROR],
    AUTH_ERROR_CODES.UNKNOWN_ERROR,
    error instanceof Error ? error : undefined
  );
}

