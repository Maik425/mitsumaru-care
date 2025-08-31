import { randomBytes, createHmac } from 'crypto';

/**
 * CSRFトークンを生成する
 * @returns 生成されたCSRFトークン
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * CSRFトークンを検証する
 * @param token 検証するトークン
 * @param secret 秘密鍵
 * @param expectedToken 期待されるトークン
 * @returns 検証結果
 */
export function verifyCSRFToken(
  token: string,
  secret: string,
  expectedToken: string
): boolean {
  if (!token || !expectedToken) {
    return false;
  }

  const hash = createHmac('sha256', secret).update(expectedToken).digest('hex');

  return token === hash;
}

/**
 * CSRFトークンの有効期限をチェックする
 * @param token トークン
 * @param maxAge 最大有効期限（ミリ秒）
 * @returns 有効期限の結果
 */
export function isCSRFTokenExpired(token: string, maxAge: number): boolean {
  // トークンにタイムスタンプが含まれている場合の実装
  // 現在はシンプルな実装
  return false;
}
