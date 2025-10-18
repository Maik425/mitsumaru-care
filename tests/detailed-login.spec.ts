import { expect, test } from '@playwright/test';

test.describe('詳細ログインテスト', () => {
  test('有効なログイン情報でログインが成功する', async ({ page }) => {
    // コンソールログを監視
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Browser console error: ${msg.text()}`);
      }
    });

    // ネットワークリクエストを監視
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`HTTP Error: ${response.status()} ${response.url()}`);
      }
    });

    await page.goto('/login');

    // ログイン情報を入力
    await page.fill('#email', 'facility1@mitsumaru-care.com');
    await page.fill('#password', 'password123');

    // ログインボタンをクリック
    await page.click('button[type="submit"]');

    // ログイン処理の完了を待つ
    await page.waitForTimeout(5000);

    // ログインが成功したかチェック（URLが変わるか、ダッシュボードが表示されるか）
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);

    // ログインが成功した場合、URLが変わるか、認証状態確認画面が表示される
    const isLoginSuccessful =
      !currentUrl.includes('/login') ||
      (await page
        .locator('text=認証状態を確認中')
        .isVisible()
        .catch(() => false));

    expect(isLoginSuccessful).toBe(true);
  });
});
