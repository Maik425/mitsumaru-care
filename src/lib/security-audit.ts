export interface SecurityEvent {
  timestamp: Date;
  eventType:
    | 'LOGIN_ATTEMPT'
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILURE'
    | 'LOGOUT'
    | 'PERMISSION_DENIED'
    | 'CSRF_VIOLATION'
    | 'RATE_LIMIT_EXCEEDED';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class SecurityAuditLogger {
  private static instance: SecurityAuditLogger;
  private events: SecurityEvent[] = [];

  private constructor() {}

  static getInstance(): SecurityAuditLogger {
    if (!SecurityAuditLogger.instance) {
      SecurityAuditLogger.instance = new SecurityAuditLogger();
    }
    return SecurityAuditLogger.instance;
  }

  logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
    };

    this.events.push(fullEvent);

    // コンソールにログ出力（本番環境では適切なログシステムに送信）
    console.log(
      `[SECURITY] ${fullEvent.timestamp.toISOString()} - ${fullEvent.eventType}: ${fullEvent.details.message || 'No message'}`
    );

    // 高重要度のイベントは即座にアラート
    if (fullEvent.severity === 'HIGH' || fullEvent.severity === 'CRITICAL') {
      this.alertSecurityEvent(fullEvent);
    }
  }

  private alertSecurityEvent(event: SecurityEvent): void {
    // 本番環境では適切なアラートシステムに送信
    console.warn(
      `[SECURITY ALERT] ${event.eventType} - Severity: ${event.severity}`
    );
    console.warn(`Details:`, event.details);
  }

  getEvents(filter?: Partial<SecurityEvent>): SecurityEvent[] {
    if (!filter) {
      return [...this.events];
    }

    return this.events.filter(event => {
      return Object.entries(filter).every(([key, value]) => {
        return event[key as keyof SecurityEvent] === value;
      });
    });
  }

  getEventsByTimeRange(startTime: Date, endTime: Date): SecurityEvent[] {
    return this.events.filter(event => {
      return event.timestamp >= startTime && event.timestamp <= endTime;
    });
  }

  getEventsBySeverity(severity: SecurityEvent['severity']): SecurityEvent[] {
    return this.events.filter(event => event.severity === severity);
  }

  clearEvents(): void {
    this.events = [];
  }
}

// 便利な関数
export const logSecurityEvent = (
  event: Omit<SecurityEvent, 'timestamp'>
): void => {
  SecurityAuditLogger.getInstance().logEvent(event);
};

export const logLoginAttempt = (
  userId: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string
): void => {
  logSecurityEvent({
    eventType: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILURE',
    userId,
    ipAddress,
    userAgent,
    details: {
      message: success ? 'ログイン成功' : 'ログイン失敗',
      success,
    },
    severity: success ? 'LOW' : 'MEDIUM',
  });
};

export const logPermissionDenied = (
  userId: string,
  resource: string,
  action: string,
  ipAddress?: string
): void => {
  logSecurityEvent({
    eventType: 'PERMISSION_DENIED',
    userId,
    ipAddress,
    details: {
      message: '権限不足によるアクセス拒否',
      resource,
      action,
    },
    severity: 'MEDIUM',
  });
};

export const logCSRFViolation = (
  userId: string,
  ipAddress?: string,
  userAgent?: string
): void => {
  logSecurityEvent({
    eventType: 'CSRF_VIOLATION',
    userId,
    ipAddress,
    userAgent,
    details: {
      message: 'CSRF攻撃の可能性',
    },
    severity: 'HIGH',
  });
};
