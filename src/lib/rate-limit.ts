/**
 * レート制限の設定
 */
export interface RateLimitConfig {
  maxRequests: number; // 最大リクエスト数
  windowMs: number; // 時間枠（ミリ秒）
  skipSuccessfulRequests?: boolean; // 成功したリクエストをスキップするか
  skipFailedRequests?: boolean; // 失敗したリクエストをスキップするか
}

/**
 * レート制限の状態
 */
export interface RateLimitState {
  requests: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

/**
 * メモリベースのレート制限ストア
 */
class MemoryRateLimitStore {
  private store = new Map<string, RateLimitState>();

  /**
   * キーのレート制限状態を取得する
   * @param key レート制限のキー
   * @returns レート制限の状態
   */
  get(key: string): RateLimitState | undefined {
    return this.store.get(key);
  }

  /**
   * キーのレート制限状態を設定する
   * @param key レート制限のキー
   * @param state レート制限の状態
   */
  set(key: string, state: RateLimitState): void {
    this.store.set(key, state);
  }

  /**
   * 期限切れのエントリをクリーンアップする
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, state] of this.store.entries()) {
      if (state.resetTime < now && !state.blocked) {
        this.store.delete(key);
      }
    }
  }
}

// グローバルなレート制限ストア
const rateLimitStore = new MemoryRateLimitStore();

// 定期的なクリーンアップ（1分ごと）
setInterval(() => {
  rateLimitStore.cleanup();
}, 60000);

/**
 * レート制限をチェックする
 * @param key レート制限のキー（例：IPアドレス、ユーザーID）
 * @param config レート制限の設定
 * @returns レート制限の結果
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  blocked: boolean;
} {
  const now = Date.now();
  const state = rateLimitStore.get(key);

  // 新しいキーの場合
  if (!state) {
    const newState: RateLimitState = {
      requests: 1,
      resetTime: now + config.windowMs,
      blocked: false,
    };
    rateLimitStore.set(key, newState);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newState.resetTime,
      blocked: false,
    };
  }

  // ブロックされている場合
  if (state.blocked && state.blockUntil && now < state.blockUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: state.blockUntil,
      blocked: true,
    };
  }

  // 時間枠がリセットされている場合
  if (now > state.resetTime) {
    const newState: RateLimitState = {
      requests: 1,
      resetTime: now + config.windowMs,
      blocked: false,
    };
    rateLimitStore.set(key, newState);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newState.resetTime,
      blocked: false,
    };
  }

  // リクエスト数が上限に達している場合
  if (state.requests >= config.maxRequests) {
    // アカウントを一時的にブロック（5分間）
    const blockUntil = now + 5 * 60 * 1000;
    const updatedState: RateLimitState = {
      ...state,
      blocked: true,
      blockUntil,
    };
    rateLimitStore.set(key, updatedState);

    return {
      allowed: false,
      remaining: 0,
      resetTime: blockUntil,
      blocked: true,
    };
  }

  // リクエスト数を増やす
  const updatedState: RateLimitState = {
    ...state,
    requests: state.requests + 1,
  };
  rateLimitStore.set(key, updatedState);

  return {
    allowed: true,
    remaining: config.maxRequests - updatedState.requests,
    resetTime: state.resetTime,
    blocked: false,
  };
}

/**
 * ログイン用のレート制限設定
 */
export const LOGIN_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 5, // 5回まで
  windowMs: 15 * 60 * 1000, // 15分間
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

/**
 * API用のレート制限設定
 */
export const API_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 100, // 100回まで
  windowMs: 15 * 60 * 1000, // 15分間
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
};

/**
 * レート制限のヘルパー関数
 */
export const rateLimitHelpers = {
  /**
   * ログインのレート制限をチェックする
   * @param key レート制限のキー
   * @returns レート制限の結果
   */
  checkLoginRateLimit: (key: string) =>
    checkRateLimit(key, LOGIN_RATE_LIMIT_CONFIG),

  /**
   * APIのレート制限をチェックする
   * @param key レート制限のキー
   * @returns レート制限の結果
   */
  checkAPIRateLimit: (key: string) =>
    checkRateLimit(key, API_RATE_LIMIT_CONFIG),
};
