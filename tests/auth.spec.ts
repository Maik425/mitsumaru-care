import { expect, test } from '@playwright/test';

test.describe('認証機能', () => {
  test('ログインページが正しく表示される', async ({ page }) => {
    await page.goto('/login');

    // ページタイトルを確認
    await expect(page).toHaveTitle(/みつまるケア/);

    // ログインフォームの要素が存在することを確認
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // ログインボタンのテキストを確認
    await expect(page.locator('button[type="submit"]')).toContainText(
      'ログイン'
    );
  });

  test('無効な認証情報でログインを試行', async ({ page }) => {
    await page.goto('/login');

    // 無効な認証情報を入力
    await page.fill('#email', 'invalid@example.com');
    await page.fill('#password', 'wrongpassword');

    // ログインボタンをクリック
    await page.click('button[type="submit"]');

    // ログインページに留まることを確認（リダイレクトされない）
    await expect(page).toHaveURL(/\/login/);
    
    // ログインフォームが再表示されることを確認
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('有効な認証情報でログイン成功', async ({ page }) => {
    await page.goto('/login');

    // 有効な認証情報を入力（テストユーザー）
    await page.fill('#email', 'admin@mitsumaru-care.com');
    await page.fill('#password', 'password123');

    // ログインボタンをクリック
    await page.click('button[type="submit"]');

    // ログイン処理の完了を待つ（最大10秒）
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // ログインページからリダイレクトされることを確認
    await expect(page).not.toHaveURL(/\/login/, { timeout: 10000 });
    
    // ダッシュボードの要素が表示されることを確認
    await expect(page.locator('text=ダッシュボード')).toBeVisible({ timeout: 10000 });
  });
});
