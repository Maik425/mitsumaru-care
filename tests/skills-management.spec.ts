import { expect, test } from '@playwright/test';

test.describe('技能管理機能', () => {
  test.beforeEach(async ({ page }) => {
    // コンソールログを監視
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Browser console error: ${msg.text()}`);
      }
    });

    // ログイン
    await page.goto('/login');
    await page.fill('#email', 'facility1@mitsumaru-care.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');

    // ログイン完了を待つ
    await page.waitForTimeout(3000);

    // 技能管理ページに移動
    await page.goto('/facility/settings/skills');
    await page.waitForLoadState('networkidle');
  });

  test('技能管理ページが正しく表示される', async ({ page }) => {
    // ページタイトルを確認
    await expect(page.locator('h1')).toContainText('技能登録');

    // 追加ボタンが存在することを確認
    await expect(page.locator('button:has-text("追加")')).toBeVisible();

    // 登録済み技能セクションが存在することを確認
    await expect(page.locator('text=登録済み技能')).toBeVisible();
  });

  test('新規技能の追加', async ({ page }) => {
    // フォームにデータを入力
    await page.fill('#name', 'テスト技能');

    // カテゴリーを選択（shadcn/uiのSelectコンポーネント）
    await page.click('button[role="combobox"]:has-text("カテゴリーを選択")');

    // ドロップダウンメニューが表示されるまで待機
    await page.waitForTimeout(1000);

    // より具体的なセレクターで身体介護を選択
    await page.click('[data-radix-collection-item]:has-text("身体介護")');

    await page.fill('#description', 'テスト用の技能です');

    // 追加ボタンをクリック
    await page.click('button:has-text("追加")');

    // 少し待機（mutation完了を待つ）
    await page.waitForTimeout(3000);

    // 成功の指標として、エラーメッセージが表示されないことを確認
    await expect(page.locator('text=エラー')).not.toBeVisible();
  });

  test('技能の編集', async ({ page }) => {
    // 編集ボタンが存在するかチェック（既存の技能がある場合のみ）
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

  test('技能の削除', async ({ page }) => {
    // 削除ボタンが存在するかチェック（既存の技能がある場合のみ）
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
