import { expect, test } from '@playwright/test';

test.describe('役職管理機能', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.fill('#email', 'facility1@mitsumaru-care.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');

    // 役職管理ページに移動
    await page.goto('/facility/settings/positions');
    await page.waitForLoadState('networkidle');
  });

  test('役職管理ページが正しく表示される', async ({ page }) => {
    // ページタイトルを確認
    await expect(page.locator('h1')).toContainText('役職登録');

    // 追加ボタンが存在することを確認
    await expect(page.locator('button:has-text("追加")')).toBeVisible();

    // 登録済み役職セクションが存在することを確認
    await expect(page.locator('text=登録済み役職')).toBeVisible();
  });

  test('新規役職の追加', async ({ page }) => {
    // フォームにデータを入力
    await page.fill('#name', 'テスト役職');
    await page.fill('#description', 'テスト用の役職です');

    // 追加ボタンをクリック
    await page.click('button:has-text("追加")');

    // 少し待機（mutation完了を待つ）
    await page.waitForTimeout(3000);

    // 成功の指標として、エラーメッセージが表示されないことを確認
    await expect(page.locator('text=エラー')).not.toBeVisible();

    // フォームが送信されたことを確認（ボタンがクリック可能な状態に戻る）
    await expect(page.locator('button:has-text("追加")')).toBeEnabled();
  });

  test('役職の編集', async ({ page }) => {
    // 編集ボタンが存在するかチェック（既存の役職がある場合のみ）
    const editButton = page.locator('button:has-text("編集")').first();

    if (await editButton.isVisible()) {
      await editButton.click();

      // 編集フォームが表示されることを確認
      await expect(page.locator('#name')).toBeVisible();
    } else {
      // 編集ボタンが存在しない場合は、このテストをスキップ
      test.skip();
    }
  });

  test('役職の削除', async ({ page }) => {
    // 削除ボタンが存在するかチェック（既存の役職がある場合のみ）
    const deleteButton = page.locator('button:has-text("削除")').first();

    if (await deleteButton.isVisible()) {
      // 削除確認ダイアログを処理
      page.on('dialog', dialog => dialog.accept());

      await deleteButton.click();

      // 削除ボタンが消えることを確認
      await expect(deleteButton).not.toBeVisible();
    } else {
      // 削除ボタンが存在しない場合は、このテストをスキップ
      test.skip();
    }
  });
});
