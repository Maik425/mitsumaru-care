// API呼び出し共通ヘルパー関数
// 既存UIのメッセージ仕様を維持するためのユーティリティ

/**
 * DOMメッセージを表示する共通関数
 * 既存UIで使われているスタイルと文言を維持
 * テスト環境での安定性を向上
 */
export function showDOMMessage(
  message: string,
  type: 'success' | 'error' | 'warning' = 'success',
  duration: number = 3000
) {
  // テスト環境での安定性向上
  if (typeof document === 'undefined') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    return;
  }

  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  messageElement.setAttribute('data-testid', `message-${type}`);
  messageElement.setAttribute('data-message', message);

  const colors = {
    success: '#10b981', // 緑 - 成功
    error: '#ef4444', // 赤 - エラー
    warning: '#f59e0b', // オレンジ - 警告
  };

  messageElement.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type]};
    color: white;
    padding: 12px 24px;
    border-radius: 6px;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
    font-size: 14px;
    opacity: 1;
    transition: opacity 0.3s ease;
  `;

  // 既存のメッセージを削除
  const existingMessages = document.querySelectorAll(
    '[data-testid^="message-"]'
  );
  existingMessages.forEach(msg => msg.remove());

  document.body.appendChild(messageElement);

  // アニメーション効果
  setTimeout(() => {
    if (messageElement && document.body.contains(messageElement)) {
      messageElement.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(messageElement)) {
          document.body.removeChild(messageElement);
        }
      }, 300);
    }
  }, duration);
}

/**
 * メッセージが表示されているかチェック（テスト用）
 */
export function isMessageVisible(
  message: string,
  type?: 'success' | 'error' | 'warning'
): boolean {
  if (typeof document === 'undefined') return false;

  const selector = type
    ? `[data-testid="message-${type}"][data-message="${message}"]`
    : `[data-message="${message}"]`;

  const element = document.querySelector(selector);
  return element !== null && element.style.opacity !== '0';
}

/**
 * ネットワークエラー時の標準メッセージ
 * 既存のService Workerと同じ文言を使用
 */
export function showNetworkError() {
  showDOMMessage('ネットワークエラー: 接続できません', 'error', 4000);
}

/**
 * オフライン状態をチェック
 */
export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

/**
 * tRPCエラーから適切なメッセージを抽出
 */
export function extractErrorMessage(error: any): string {
  if (error?.message) {
    return error.message;
  }
  if (error?.data?.message) {
    return error.data.message;
  }
  return 'エラーが発生しました';
}

/**
 * API呼び出しの共通エラーハンドリング
 */
export function handleApiError(
  error: any,
  defaultMessage: string = 'エラーが発生しました'
) {
  console.error('API Error:', error);

  if (isOffline()) {
    showNetworkError();
    return;
  }

  const message = extractErrorMessage(error) || defaultMessage;
  showDOMMessage(message, 'error');
}

/**
 * 成功メッセージの表示（既存UIの文言を維持）
 */
export const successMessages = {
  shiftGenerated: 'シフトが生成されました',
  shiftSaved: '保存されました',
  correctionSubmitted: '修正申請が送信されました',
  exchangeRequested: 'シフト交換申請が送信されました',
  exchangeApproved: '承認されました',
  attendanceRecorded: '出勤が記録されました',
  checkoutRecorded: '退勤が記録されました',
} as const;

/**
 * 成功メッセージを表示
 */
export function showSuccessMessage(messageKey: keyof typeof successMessages) {
  const message = successMessages[messageKey];
  showDOMMessage(message, 'success');

  // テスト環境でのデバッグ
  if (process.env.NODE_ENV === 'test') {
    console.log(`Success message displayed: ${message}`);
  }
}
