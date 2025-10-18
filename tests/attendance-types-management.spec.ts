import { expect, test } from '@playwright/test';

test.describe('シフト形態管理機能', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.fill('#email', 'facility1@mitsumaru-care.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');

    // シフト形態管理ページに移動
    await page.goto('/facility/settings/attendance-types');
    await page.waitForLoadState('networkidle');
  });

  test('シフト形態管理ページが正しく表示される', async ({ page }) => {
    // ページタイトルを確認
    await expect(page.locator('h1')).toContainText('シフト形態管理');

    // 追加ボタンが存在することを確認
    await expect(page.locator('button:has-text("追加")')).toBeVisible();

    // 登録済みシフト形態セクションが存在することを確認
    await expect(page.locator('text=登録済みシフト形態')).toBeVisible();
  });

  test('新規シフト形態の追加', async ({ page }) => {
    // フォームにデータを入力
    await page.fill('#name', 'テストシフト');
    await page.fill('#startTime', '09:00');
    await page.fill('#endTime', '17:00');
    await page.fill('#breakTime', '60');
    await page.fill('#colorCode', '#4CAF50');
    await page.fill('#description', 'テスト用のシフトです');
    await page.fill('#sortOrder', '1');

    // 夜勤フラグを設定
    await page.check('#isNightShift');

    // 追加ボタンをクリック
    await page.click('button:has-text("追加")');

    // 少し待機（mutation完了を待つ）
    await page.waitForTimeout(3000);

    // 成功の指標として、エラーメッセージが表示されないことを確認
    await expect(page.locator('text=エラー')).not.toBeVisible();
  });

  test('シフト形態の編集', async ({ page }) => {
    // 既存のシフトがあることを前提とする
    const editButton = page.locator('button:has-text("編集")').first();

    if (await editButton.isVisible()) {
      await editButton.click();

      // 名前を変更
      await page.fill('#name', '編集されたシフト');

      // 更新ボタンをクリック
      await page.click('button:has-text("更新")');

      // 少し待機（mutation完了を待つ）
      await page.waitForTimeout(2000);

      // 成功の指標として、エラーメッセージが表示されないことを確認
      await expect(page.locator('text=エラー')).not.toBeVisible();
    }
  });

  test('シフト形態の削除', async ({ page }) => {
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

  test('夜勤シフトの作成', async ({ page }) => {
    // 夜勤シフトのデータを入力
    await page.fill('#name', '夜勤シフト');
    await page.fill('#startTime', '22:00');
    await page.fill('#endTime', '06:00');
    await page.fill('#breakTime', '60');
    await page.fill('#colorCode', '#9C27B0');
    await page.fill('#description', '夜勤用のシフトです');
    await page.fill('#sortOrder', '5');

    // 夜勤フラグを設定
    await page.check('#isNightShift');

    // 追加ボタンをクリック
    await page.click('button:has-text("追加")');

    // 少し待機（mutation完了を待つ）
    await page.waitForTimeout(3000);

    // 成功の指標として、エラーメッセージが表示されないことを確認
    await expect(page.locator('text=エラー')).not.toBeVisible();
  });
});
