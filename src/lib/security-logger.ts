/**
 * セキュリティイベントの種類
 */
export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  ROLE_CHANGE = 'ROLE_CHANGE',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
}

/**
 * セキュリティイベントの重要度
 */
export enum SecurityEventSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * セキュリティイベントのインターフェース
 */
export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: Date;
  source: string;
}

/**
 * セキュリティログを記録する
 * @param event セキュリティイベント
 */
export function logSecurityEvent(
  event: Omit<SecurityEvent, 'id' | 'timestamp'>
): void {
  const securityEvent: SecurityEvent = {
    ...event,
    id: generateEventId(),
    timestamp: new Date(),
  };

  // コンソールにログ出力（本番環境では適切なログサービスに送信）
  console.log('[SECURITY]', securityEvent);

  // TODO: 本番環境ではデータベースやログサービスに送信
  // await saveSecurityEventToDatabase(securityEvent);
}

/**
 * イベントIDを生成する
 * @returns 生成されたイベントID
 */
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * ログイン成功イベントを記録する
 * @param userId ユーザーID
 * @param userEmail ユーザーメールアドレス
 * @param ipAddress IPアドレス
 * @param userAgent ユーザーエージェント
 */
export function logLoginSuccess(
  userId: string,
  userEmail: string,
  ipAddress?: string,
  userAgent?: string
): void {
  logSecurityEvent({
    type: SecurityEventType.LOGIN_SUCCESS,
    severity: SecurityEventSeverity.LOW,
    userId,
    userEmail,
    ipAddress,
    userAgent,
    details: { message: 'ログイン成功' },
    source: 'auth-system',
  });
}

/**
 * ログイン失敗イベントを記録する
 * @param userEmail ユーザーメールアドレス
 * @param ipAddress IPアドレス
 * @param userAgent ユーザーエージェント
 * @param reason 失敗理由
 */
export function logLoginFailure(
  userEmail: string,
  ipAddress?: string,
  userAgent?: string,
  reason?: string
): void {
  logSecurityEvent({
    type: SecurityEventType.LOGIN_FAILURE,
    severity: SecurityEventSeverity.MEDIUM,
    userEmail,
    ipAddress,
    userAgent,
    details: {
      message: 'ログイン失敗',
      reason: reason || '不明',
    },
    source: 'auth-system',
  });
}

/**
 * 権限拒否イベントを記録する
 * @param userId ユーザーID
 * @param userEmail ユーザーメールアドレス
 * @param requiredPermission 必要な権限
 * @param ipAddress IPアドレス
 * @param userAgent ユーザーエージェント
 */
export function logPermissionDenied(
  userId: string,
  userEmail: string,
  requiredPermission: string,
  ipAddress?: string,
  userAgent?: string
): void {
  logSecurityEvent({
    type: SecurityEventType.PERMISSION_DENIED,
    severity: SecurityEventSeverity.MEDIUM,
    userId,
    userEmail,
    ipAddress,
    userAgent,
    details: {
      message: '権限不足',
      requiredPermission,
    },
    source: 'auth-system',
  });
}
