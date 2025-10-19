import { expect, test } from '@playwright/test';

test.describe('ナビゲーションフック機能', () => {
  test('ロール別メニュー設定が正しく取得される', async ({ page }) => {
    // システム管理者でログイン
    await page.goto('/login');
    await page.fill('#email', 'admin@mitsumaru-care.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    await page.goto('/system/dashboard');

    // システム管理者用メニューが表示されることを確認
    await expect(page.locator('text=ユーザー管理')).toBeVisible();
    await expect(page.locator('text=システム管理')).toBeVisible();
    await expect(page.locator('text=監査ログ')).toBeVisible();
  });

  test('権限チェックが正しく動作する', async ({ page }) => {
    // 一般ユーザーでログイン
    await page.goto('/login');
    await page.fill('#email', 'user1@mitsumaru-care.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    await page.goto('/user/dashboard');

    // 一般ユーザー用メニューのみが表示されることを確認
    await expect(page.locator('text=ダッシュボード')).toBeVisible();
    await expect(page.locator('text=勤怠申請')).toBeVisible();
    await expect(page.locator('text=希望休申請')).toBeVisible();

    // 管理者用メニューが表示されないことを確認
    await expect(page.locator('text=ユーザー管理')).not.toBeVisible();
    await expect(page.locator('text=シフト管理')).not.toBeVisible();
  });

  test('認証状態の確認が正しく動作する', async ({ page }) => {
    // 未認証状態でダッシュボードにアクセス
    await page.goto('/user/dashboard');

    // アクセス権限がないメッセージが表示されることを確認
    await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
    await expect(page.locator('text=アクセス権限がありません')).toBeVisible();
  });

  test('ローディング状態が正しく表示される', async ({ page }) => {
    // ログイン処理中にダッシュボードにアクセス
    await page.goto('/login');
    await page.fill('#email', 'user1@mitsumaru-care.com');
    await page.fill('#password', 'password123');

    // ログインボタンをクリックして、すぐにダッシュボードにアクセス
    await page.click('button[type="submit"]');
    await page.goto('/user/dashboard');

    // ローディング状態が表示されることを確認（短時間）
    await expect(page.locator('text=読み込み中...')).toBeVisible();
  });
});
