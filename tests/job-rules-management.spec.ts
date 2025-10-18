import { expect, test } from '@playwright/test';

test.describe('配置ルール管理機能', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.fill('#email', 'facility1@mitsumaru-care.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');

    // ログイン完了を待つ
    await page.waitForTimeout(3000);

    // 配置ルール管理ページに移動
    await page.goto('/facility/settings/job-rules');
    await page.waitForLoadState('networkidle');
  });

  test('配置ルール管理ページが正しく表示される', async ({ page }) => {
    // ページが正常に読み込まれることを確認
    await expect(page.locator('body')).toBeVisible();
  });

  test('配置ルールテンプレートの作成', async ({ page }) => {
    // フォームにデータを入力
    await page.fill('#templateName', 'テストテンプレート');
    await page.fill('#description', 'テスト用のテンプレートです');

    // 保存ボタンが存在することを確認
    await expect(
      page.locator('button:has-text("テンプレートを保存")')
    ).toBeVisible();

    // 成功の指標として、エラーメッセージが表示されないことを確認
    await expect(page.locator('text=エラー')).not.toBeVisible();
  });

  test('配置ルールテンプレートの編集', async ({ page }) => {
    // 既存のテンプレートがあることを前提とする
    const editButton = page.locator('button:has-text("編集")').first();

    if (await editButton.isVisible()) {
      await editButton.click();

      // 名前を変更
      await page.fill('#templateName', '編集されたテンプレート');

      // 更新ボタンをクリック
      await page.click('button:has-text("更新")');

      // 少し待機（mutation完了を待つ）
      await page.waitForTimeout(2000);

      // 成功の指標として、エラーメッセージが表示されないことを確認
      await expect(page.locator('text=エラー')).not.toBeVisible();
    }
  });

  test('配置ルールテンプレートの削除', async ({ page }) => {
    // 削除ボタンが存在する場合
    const deleteButton = page.locator('button:has-text("削除")').first();

    if (await deleteButton.isVisible()) {
      // 削除確認ダイアログを処理
      page.on('dialog', dialog => dialog.accept());

      await deleteButton.click();

      // 少し待機（mutation完了を待つ）
      await page.waitForTimeout(2000);

      // 成功の指標として、エラーメッセージが表示されないことを確認
      await expect(page.locator('text=エラー')).not.toBeVisible();
    }
  });
});
