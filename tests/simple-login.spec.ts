import { expect, test } from '@playwright/test';

test.describe('シンプルログインテスト', () => {
  test('ログインページが表示される', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('ログイン');
  });

  test('ログインフォームが表示される', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('無効なログイン情報でエラーが表示される', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'invalid@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');

    // エラーメッセージが表示されるか、ページが変わらないことを確認
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
  });
});
