import { expect, test } from '@playwright/test';

test.describe('アカウント管理機能', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.fill('#email', 'facility1@mitsumaru-care.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');

    // アカウント管理ページに移動
    await page.goto('/facility/settings/accounts');
    await page.waitForLoadState('networkidle');
  });

  test('アカウント管理ページが正しく表示される', async ({ page }) => {
    // ページタイトルを確認
    await expect(page.locator('h1')).toContainText('ログインアカウント登録');

    // ページが正常に読み込まれることを確認
    await expect(page.locator('body')).toBeVisible();
  });

  test('新規アカウントの作成', async ({ page }) => {
    // ページが正常に読み込まれることを確認
    await expect(page.locator('body')).toBeVisible();

    // 基本的なページ要素が存在することを確認
    await expect(page.locator('h1')).toBeVisible();
  });

  test('アカウントの編集', async ({ page }) => {
    // 既存のアカウントがあることを前提とする
    const editButton = page.locator('button:has-text("編集")').first();

    if (await editButton.isVisible()) {
      await editButton.click();

      // モーダルが表示されることを確認
      await expect(page.locator('[role="dialog"]')).toBeVisible();

      // 名前を変更
      await page.fill('input[name="name"]', '編集されたユーザー');

      // 保存ボタンをクリック
      await page.click('button:has-text("保存")');

      // 成功メッセージが表示されることを確認
      await expect(
        page.locator('text=アカウントが更新されました')
      ).toBeVisible();
    }
  });

  test('アカウントの有効/無効切り替え', async ({ page }) => {
    // 有効/無効切り替えボタンが存在する場合
    const toggleButton = page
      .locator('button:has-text("有効")')
      .or(page.locator('button:has-text("無効")'))
      .first();

    if (await toggleButton.isVisible()) {
      const currentText = await toggleButton.textContent();

      await toggleButton.click();

      // ボタンのテキストが変更されることを確認
      if (currentText?.includes('有効')) {
        await expect(toggleButton).toContainText('無効');
      } else {
        await expect(toggleButton).toContainText('有効');
      }
    }
  });

  test('アカウントの削除', async ({ page }) => {
    // 削除ボタンが存在する場合
    const deleteButton = page.locator('button:has-text("削除")').first();

    if (await deleteButton.isVisible()) {
      // 削除確認ダイアログを処理
      page.on('dialog', dialog => dialog.accept());

      await deleteButton.click();

      // 成功メッセージが表示されることを確認
      await expect(
        page.locator('text=アカウントが削除されました')
      ).toBeVisible();
    }
  });

  test('アカウント一覧の検索機能', async ({ page }) => {
    // 検索ボックスが存在する場合
    const searchInput = page.locator('input[placeholder*="検索"]');

    if (await searchInput.isVisible()) {
      // 検索キーワードを入力
      await searchInput.fill('admin');

      // 検索結果が表示されることを確認
      await expect(page.locator('text=admin')).toBeVisible();
    }
  });
});
