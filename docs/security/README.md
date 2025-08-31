# セキュリティ設計書

## 📋 1. 概要

このドキュメントでは、みつまるケアシステムのセキュリティ設計について詳細に説明します。

### 1.1 設計方針

- **多層防御**による包括的なセキュリティ対策
- **最小権限の原則**に基づくアクセス制御
- **データ保護**による機密情報の保護
- **監査・ログ**によるセキュリティ監視
- **コンプライアンス**対応による法的要件の充足

### 1.2 セキュリティ要件

- **認証・認可**: 安全なユーザー認証と権限管理
- **データ保護**: 個人情報・機密データの暗号化
- **通信セキュリティ**: HTTPS/TLSによる通信暗号化
- **監査・ログ**: セキュリティイベントの記録・監視
- **インシデント対応**: セキュリティ事象への対応体制

## 🔐 2. 認証・認可システム

### 2.1 認証システム

```typescript
// 認証フローの実装
export class AuthenticationService {
  // Supabase認証によるログイン
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // JWTトークンの検証
      const user = await this.verifyToken(data.session.access_token);

      return {
        user,
        session: data.session,
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // パスワードポリシーの検証
  validatePassword(password: string): PasswordValidationResult {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const isValid =
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar;

    return {
      isValid,
      errors: [
        password.length < minLength &&
          'パスワードは8文字以上である必要があります',
        !hasUpperCase && '大文字を含む必要があります',
        !hasLowerCase && '小文字を含む必要があります',
        !hasNumbers && '数字を含む必要があります',
        !hasSpecialChar && '特殊文字を含む必要があります',
      ].filter(Boolean),
    };
  }

  // 多要素認証（MFA）の実装
  async enableMFA(userId: string): Promise<MFAResult> {
    try {
      const { data, error } = await this.supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) throw error;

      return {
        success: true,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
```

### 2.2 権限管理システム

```typescript
// ロールベースアクセス制御（RBAC）
export class AuthorizationService {
  // 権限チェック
  async checkPermission(
    userId: string,
    tenantId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    try {
      const userRole = await this.getUserRole(userId, tenantId);
      const permissions = this.getRolePermissions(userRole);

      return permissions.some(
        p => p.resource === resource && p.action === action
      );
    } catch (error) {
      return false;
    }
  }

  // 権限定義
  private getRolePermissions(role: UserRole): Permission[] {
    const permissions: Record<UserRole, Permission[]> = {
      OWNER: [
        { resource: '*', action: '*' }, // 全権限
      ],
      ADMIN: [
        { resource: 'shift', action: '*' },
        { resource: 'role', action: '*' },
        { resource: 'attendance', action: '*' },
        { resource: 'user', action: 'read' },
        { resource: 'user', action: 'update' },
        { resource: 'master', action: '*' },
      ],
      MEMBER: [
        { resource: 'attendance', action: 'read' },
        { resource: 'attendance', action: 'create' },
        { resource: 'attendance', action: 'update' },
        { resource: 'holiday', action: 'read' },
        { resource: 'holiday', action: 'create' },
        { resource: 'holiday', action: 'update' },
      ],
    };

    return permissions[role] || [];
  }

  // リソースレベルの権限チェック
  async checkResourcePermission(
    userId: string,
    resourceId: string,
    resourceType: string,
    action: string
  ): Promise<boolean> {
    try {
      // ユーザーがリソースにアクセスできるかチェック
      const hasAccess = await this.verifyResourceAccess(
        userId,
        resourceId,
        resourceType
      );

      if (!hasAccess) return false;

      // アクション権限をチェック
      return await this.checkPermission(userId, resourceType, action);
    } catch (error) {
      return false;
    }
  }
}
```

### 2.3 セッション管理

```typescript
// セッション管理の実装
export class SessionService {
  // セッション作成
  async createSession(userId: string, tenantId: string): Promise<Session> {
    const sessionId = this.generateSessionId();
    const expiresAt = new Date(Date.now() + this.sessionTimeout);

    const session: Session = {
      id: sessionId,
      userId,
      tenantId,
      createdAt: new Date(),
      expiresAt,
      lastActivity: new Date(),
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent(),
    };

    // Redisにセッション保存
    await this.redis.setex(
      `session:${sessionId}`,
      this.sessionTimeout / 1000,
      JSON.stringify(session)
    );

    return session;
  }

  // セッション検証
  async validateSession(sessionId: string): Promise<Session | null> {
    try {
      const sessionData = await this.redis.get(`session:${sessionId}`);
      if (!sessionData) return null;

      const session: Session = JSON.parse(sessionData);

      // セッション期限チェック
      if (new Date() > session.expiresAt) {
        await this.destroySession(sessionId);
        return null;
      }

      // 最終アクティビティ更新
      session.lastActivity = new Date();
      await this.redis.setex(
        `session:${sessionId}`,
        this.sessionTimeout / 1000,
        JSON.stringify(session)
      );

      return session;
    } catch (error) {
      return null;
    }
  }

  // セッション破棄
  async destroySession(sessionId: string): Promise<void> {
    await this.redis.del(`session:${sessionId}`);
  }
}
```

## 🔒 3. データ保護

### 3.1 データ暗号化

```typescript
// データ暗号化サービスの実装
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;

  // 機密データの暗号化
  async encryptSensitiveData(data: string): Promise<EncryptedData> {
    try {
      const key = await this.generateEncryptionKey();
      const iv = crypto.randomBytes(this.ivLength);

      const cipher = crypto.createCipher(this.algorithm, key);
      cipher.setAAD(Buffer.from('mitsumaru-care'));

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        algorithm: this.algorithm,
      };
    } catch (error) {
      throw new Error('データの暗号化に失敗しました');
    }
  }

  // 暗号化データの復号化
  async decryptSensitiveData(encryptedData: EncryptedData): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const tag = Buffer.from(encryptedData.tag, 'hex');

      const decipher = crypto.createDecipher(this.algorithm, key);
      decipher.setAAD(Buffer.from('mitsumaru-care'));
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error('データの復号化に失敗しました');
    }
  }

  // ハッシュ化（パスワード等）
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // パスワード検証
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
```

### 3.2 個人情報保護

```typescript
// 個人情報保護サービスの実装
export class PersonalDataProtectionService {
  // 個人情報のマスキング
  maskPersonalData(data: any): any {
    const maskedData = { ...data };

    // メールアドレスのマスキング
    if (maskedData.email) {
      const [local, domain] = maskedData.email.split('@');
      maskedData.email = `${local.charAt(0)}***@${domain}`;
    }

    // 電話番号のマスキング
    if (maskedData.phoneNumber) {
      maskedData.phoneNumber = maskedData.phoneNumber.replace(
        /(\d{3})(\d{4})(\d{4})/,
        '$1-****-$3'
      );
    }

    // 社員番号のマスキング
    if (maskedData.employeeNumber) {
      maskedData.employeeNumber = `***${maskedData.employeeNumber.slice(-3)}`;
    }

    return maskedData;
  }

  // 個人情報の匿名化
  async anonymizePersonalData(userId: string): Promise<void> {
    try {
      const user = await this.userRepository.findById(userId);

      // 個人情報を匿名化
      const anonymizedUser = {
        ...user,
        name: `ユーザー${userId.slice(-6)}`,
        email: `user_${userId.slice(-6)}@anonymized.com`,
        phoneNumber: null,
        employeeNumber: `ANON_${userId.slice(-6)}`,
      };

      await this.userRepository.update(userId, anonymizedUser);

      // 匿名化ログを記録
      await this.auditLogService.log({
        action: 'PERSONAL_DATA_ANONYMIZED',
        userId,
        details: '個人情報が匿名化されました',
        timestamp: new Date(),
      });
    } catch (error) {
      throw new Error('個人情報の匿名化に失敗しました');
    }
  }
}
```

## 🌐 4. 通信セキュリティ

### 4.1 HTTPS/TLS設定

```typescript
// HTTPS設定の実装
export class SecurityMiddleware {
  // セキュリティヘッダーの設定
  setSecurityHeaders(req: Request, res: Response, next: NextFunction): void {
    // HSTS（HTTP Strict Transport Security）
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );

    // XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    );

    // X-Frame-Options
    res.setHeader('X-Frame-Options', 'DENY');

    // X-Content-Type-Options
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    next();
  }

  // CORS設定
  configureCORS(): RequestHandler {
    return cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3000',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['X-Total-Count'],
    });
  }

  // レート制限
  rateLimit(): RequestHandler {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15分
      max: 100, // 最大100リクエスト
      message: 'リクエストが多すぎます。しばらく待ってから再試行してください。',
      standardHeaders: true,
      legacyHeaders: false,
    });
  }
}
```

### 4.2 API セキュリティ

```typescript
// API セキュリティの実装
export class APISecurityService {
  // 入力値のサニタイゼーション
  sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return this.sanitizeString(input);
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }

    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return input;
  }

  // 文字列のサニタイゼーション
  private sanitizeString(str: string): string {
    return str
      .replace(/[<>]/g, '') // HTMLタグの除去
      .replace(/javascript:/gi, '') // JavaScriptプロトコルの除去
      .replace(/on\w+=/gi, '') // イベントハンドラの除去
      .trim();
  }

  // SQLインジェクション対策
  validateSQLInput(input: any): boolean {
    const sqlKeywords = [
      'SELECT',
      'INSERT',
      'UPDATE',
      'DELETE',
      'DROP',
      'CREATE',
      'ALTER',
      'EXEC',
      'EXECUTE',
      'UNION',
      '--',
      '/*',
      '*/',
    ];

    const inputStr = JSON.stringify(input).toUpperCase();

    return !sqlKeywords.some(keyword => inputStr.includes(keyword));
  }
}
```

## 📊 5. 監査・ログ

### 5.1 セキュリティログ

```typescript
// セキュリティログサービスの実装
export class SecurityAuditService {
  // セキュリティイベントのログ記録
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      const logEntry: SecurityLogEntry = {
        id: this.generateLogId(),
        timestamp: new Date(),
        eventType: event.type,
        userId: event.userId,
        tenantId: event.tenantId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        details: event.details,
        severity: event.severity,
        status: event.status,
      };

      // データベースにログ保存
      await this.securityLogRepository.create(logEntry);

      // 高リスクイベントの場合はアラート送信
      if (event.severity === 'HIGH' || event.severity === 'CRITICAL') {
        await this.sendSecurityAlert(logEntry);
      }
    } catch (error) {
      console.error('セキュリティログの記録に失敗しました:', error);
    }
  }

  // ログイン試行の監視
  async monitorLoginAttempts(
    userId: string,
    ipAddress: string
  ): Promise<boolean> {
    try {
      const recentAttempts =
        await this.securityLogRepository.findRecentLoginAttempts(
          userId,
          ipAddress,
          15 * 60 * 1000 // 15分
        );

      const failedAttempts = recentAttempts.filter(
        attempt => attempt.status === 'FAILED'
      );

      // 5回以上の失敗でアカウントロック
      if (failedAttempts.length >= 5) {
        await this.lockAccount(userId);
        await this.logSecurityEvent({
          type: 'ACCOUNT_LOCKED',
          userId,
          ipAddress,
          severity: 'HIGH',
          status: 'SUCCESS',
          details: '複数回のログイン失敗によりアカウントがロックされました',
        });

        return false;
      }

      return true;
    } catch (error) {
      console.error('ログイン試行の監視に失敗しました:', error);
      return false;
    }
  }

  // セキュリティアラートの送信
  private async sendSecurityAlert(logEntry: SecurityLogEntry): Promise<void> {
    try {
      const alert = {
        title: `セキュリティアラート: ${logEntry.eventType}`,
        message: logEntry.details,
        severity: logEntry.severity,
        timestamp: logEntry.timestamp,
        userId: logEntry.userId,
        tenantId: logEntry.tenantId,
      };

      // 管理者に通知
      await this.notificationService.sendToAdmins(alert);

      // Slack等の外部サービスに通知
      await this.externalNotificationService.send(alert);
    } catch (error) {
      console.error('セキュリティアラートの送信に失敗しました:', error);
    }
  }
}
```

### 5.2 アクセスログ

```typescript
// アクセスログサービスの実装
export class AccessLogService {
  // APIアクセスのログ記録
  async logAPIAccess(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const startTime = Date.now();

    res.on('finish', async () => {
      const duration = Date.now() - startTime;

      const logEntry: AccessLogEntry = {
        timestamp: new Date(),
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        tenantId: req.user?.tenantId,
        requestSize: req.headers['content-length'] || 0,
        responseSize: res.get('content-length') || 0,
      };

      await this.accessLogRepository.create(logEntry);
    });

    next();
  }

  // ファイルアクセスのログ記録
  async logFileAccess(
    userId: string,
    fileId: string,
    action: 'READ' | 'WRITE' | 'DELETE',
    success: boolean
  ): Promise<void> {
    const logEntry: FileAccessLogEntry = {
      timestamp: new Date(),
      userId,
      fileId,
      action,
      success,
      ipAddress: this.getClientIP(),
    };

    await this.fileAccessLogRepository.create(logEntry);
  }
}
```

## 🚨 6. インシデント対応

### 6.1 セキュリティインシデント対応

```typescript
// セキュリティインシデント対応サービスの実装
export class SecurityIncidentService {
  // インシデントの検出・分類
  async detectIncident(event: SecurityEvent): Promise<SecurityIncident | null> {
    try {
      // インシデントの分類
      const incidentType = this.classifyIncident(event);

      if (!incidentType) return null;

      // インシデントの作成
      const incident: SecurityIncident = {
        id: this.generateIncidentId(),
        type: incidentType,
        severity: event.severity,
        status: 'OPEN',
        detectedAt: new Date(),
        events: [event],
        assignedTo: null,
        resolution: null,
        closedAt: null,
      };

      // インシデントデータベースに保存
      await this.incidentRepository.create(incident);

      // 自動対応アクションの実行
      await this.executeAutomaticResponse(incident);

      return incident;
    } catch (error) {
      console.error('インシデントの検出に失敗しました:', error);
      return null;
    }
  }

  // インシデントの分類
  private classifyIncident(event: SecurityEvent): IncidentType | null {
    const classificationRules: ClassificationRule[] = [
      {
        pattern: /LOGIN_FAILURE/i,
        type: 'AUTHENTICATION_FAILURE',
        threshold: 5,
        timeWindow: 15 * 60 * 1000, // 15分
      },
      {
        pattern: /SQL_INJECTION/i,
        type: 'ATTACK_ATTEMPT',
        threshold: 1,
        timeWindow: 60 * 1000, // 1分
      },
      {
        pattern: /UNAUTHORIZED_ACCESS/i,
        type: 'UNAUTHORIZED_ACCESS',
        threshold: 3,
        timeWindow: 60 * 60 * 1000, // 1時間
      },
    ];

    for (const rule of classificationRules) {
      if (rule.pattern.test(event.type)) {
        const recentEvents = this.getRecentEvents(
          event.userId,
          rule.timeWindow
        );
        if (recentEvents.length >= rule.threshold) {
          return rule.type;
        }
      }
    }

    return null;
  }

  // 自動対応アクションの実行
  private async executeAutomaticResponse(
    incident: SecurityIncident
  ): Promise<void> {
    try {
      switch (incident.type) {
        case 'AUTHENTICATION_FAILURE':
          await this.lockAccount(incident.events[0].userId);
          break;

        case 'ATTACK_ATTEMPT':
          await this.blockIPAddress(incident.events[0].ipAddress);
          break;

        case 'UNAUTHORIZED_ACCESS':
          await this.revokeUserSessions(incident.events[0].userId);
          break;
      }
    } catch (error) {
      console.error('自動対応アクションの実行に失敗しました:', error);
    }
  }
}
```

## 📋 7. セキュリティポリシー

### 7.1 パスワードポリシー

```typescript
// パスワードポリシーの実装
export class PasswordPolicyService {
  // パスワード強度の検証
  validatePasswordStrength(password: string): PasswordStrengthResult {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      specialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noCommonPatterns: !this.hasCommonPatterns(password),
      noPersonalInfo: !this.hasPersonalInfo(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    const strength = this.calculateStrength(score);

    return {
      isValid: score >= 6,
      score,
      strength,
      checks,
      suggestions: this.generateSuggestions(checks),
    };
  }

  // パスワードの有効期限管理
  async checkPasswordExpiry(userId: string): Promise<PasswordExpiryResult> {
    try {
      const user = await this.userRepository.findById(userId);
      const passwordAge = Date.now() - user.passwordChangedAt.getTime();
      const maxAge = 90 * 24 * 60 * 60 * 1000; // 90日

      const daysUntilExpiry = Math.ceil(
        (maxAge - passwordAge) / (24 * 60 * 60 * 1000)
      );

      return {
        isExpired: passwordAge > maxAge,
        daysUntilExpiry: Math.max(0, daysUntilExpiry),
        requiresChange: daysUntilExpiry <= 7,
      };
    } catch (error) {
      throw new Error('パスワード有効期限の確認に失敗しました');
    }
  }
}
```

### 7.2 アクセスポリシー

```typescript
// アクセスポリシーの実装
export class AccessPolicyService {
  // 時間ベースアクセス制御
  async checkTimeBasedAccess(userId: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findById(userId);
      const now = new Date();
      const hour = now.getHours();

      // 管理者は24時間アクセス可能
      if (user.role === 'ADMIN' || user.role === 'OWNER') {
        return true;
      }

      // 一般職は8:00-22:00のみアクセス可能
      return hour >= 8 && hour < 22;
    } catch (error) {
      return false;
    }
  }

  // 場所ベースアクセス制御
  async checkLocationBasedAccess(
    userId: string,
    ipAddress: string
  ): Promise<boolean> {
    try {
      const allowedNetworks = await this.getAllowedNetworks(userId);

      return allowedNetworks.some(network =>
        this.isIPInNetwork(ipAddress, network)
      );
    } catch (error) {
      return false;
    }
  }
}
```

---

**次段階**: [運用設計](./../operations/README.md) に進む
