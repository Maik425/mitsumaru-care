import { expect, test } from '@playwright/test';
import {
  loginAsSystemAdmin,
  verifyLoginState,
  verifyTestUsersExist,
} from './helpers/auth-helper';

test.describe('データエクスポート機能（統合テスト）', () => {
  // テスト開始前にテストユーザーの存在を確認
  test.beforeAll(async () => {
    await verifyTestUsersExist();
  });

  test('ログインページが表示される', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('ログイン');
  });

  test('システム管理者としてログインできる', async ({ page }) => {
    await loginAsSystemAdmin(page);
    await verifyLoginState(page, 'system_admin');
  });

  test('エクスポートページにアクセスできる', async ({ page }) => {
    // システム管理者としてログイン
    await loginAsSystemAdmin(page);

    // エクスポートページに移動
    await page.goto('/system/export');
    await page.waitForLoadState('networkidle');

    // タイトルを確認
    await expect(page.locator('h1')).toContainText('データエクスポート');

    // エクスポートカードが表示されていることを確認
    await expect(
      page.locator('span:has-text("勤怠記録")').first()
    ).toBeVisible();
    await expect(
      page.locator('span:has-text("ユーザー情報")').first()
    ).toBeVisible();
    await expect(
      page.locator('span:has-text("施設情報")').first()
    ).toBeVisible();
  });

  test('エクスポートページの要素が正しく表示される', async ({ page }) => {
    // システム管理者としてログイン
    await loginAsSystemAdmin(page);

    // エクスポートページに移動
    await page.goto('/system/export');
    await page.waitForLoadState('networkidle');

    // ページタイトルを確認
    await expect(
      page.locator('h1:has-text("データエクスポート")')
    ).toBeVisible();

    // 各エクスポートカードを確認
    await expect(
      page.locator('span:has-text("勤怠記録")').first()
    ).toBeVisible();
    await expect(
      page.locator('span:has-text("ユーザー情報")').first()
    ).toBeVisible();
    await expect(
      page.locator('span:has-text("施設情報")').first()
    ).toBeVisible();

    // 各エクスポートボタンを確認
    const exportButtons = page.locator('button:has-text("エクスポート実行")');
    await expect(exportButtons).toHaveCount(3);

    // ページの説明文を確認
    await expect(
      page
        .locator(
          'p:has-text("勤怠記録、ユーザー情報、施設情報をCSV/Excel形式でエクスポートできます")'
        )
        .first()
    ).toBeVisible();
  });

  test('各エクスポートボタンが個別に動作する', async ({ page }) => {
    // システム管理者としてログイン
    await loginAsSystemAdmin(page);

    // エクスポートページに移動
    await page.goto('/system/export');
    await page.waitForLoadState('networkidle');

    // コンソールログを監視
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // 勤怠記録のエクスポートボタンをクリック
    console.log('Testing attendance export...');
    const attendanceButton = page
      .locator('button:has-text("エクスポート実行")')
      .first();
    await expect(attendanceButton).toBeVisible();
    await attendanceButton.click();

    // 少し待つ
    await page.waitForTimeout(3000);

    // ユーザー情報のエクスポートボタンをクリック
    console.log('Testing users export...');
    const usersButton = page
      .locator('button:has-text("エクスポート実行")')
      .nth(1);
    await expect(usersButton).toBeVisible();
    await usersButton.click();

    // 少し待つ
    await page.waitForTimeout(3000);

    // 施設情報のエクスポートボタンをクリック
    console.log('Testing facilities export...');
    const facilitiesButton = page
      .locator('button:has-text("エクスポート実行")')
      .nth(2);
    await expect(facilitiesButton).toBeVisible();
    await facilitiesButton.click();

    // 少し待つ
    await page.waitForTimeout(3000);

    // コンソールログを確認
    console.log('=== Console Logs ===');
    consoleLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    console.log('=== End Console Logs ===');

    // 各ボタンが個別に動作していることを確認
    const attendanceLogs = consoleLogs.filter(log =>
      log.includes('Starting export for type: attendance')
    );
    const usersLogs = consoleLogs.filter(log =>
      log.includes('Starting export for type: users')
    );
    const facilitiesLogs = consoleLogs.filter(log =>
      log.includes('Starting export for type: facilities')
    );

    expect(attendanceLogs.length).toBeGreaterThan(0);
    expect(usersLogs.length).toBeGreaterThan(0);
    expect(facilitiesLogs.length).toBeGreaterThan(0);

    console.log('All export buttons are working individually!');
  });

  test('勤怠記録のエクスポートが実際にダウンロードされる', async ({ page }) => {
    // システム管理者としてログイン
    await loginAsSystemAdmin(page);

    // エクスポートページに移動
    await page.goto('/system/export');
    await page.waitForLoadState('networkidle');

    // ダウンロードの開始を監視
    const downloadPromise = page.waitForEvent('download');

    // 勤怠記録のエクスポートボタンをクリック
    const attendanceButton = page
      .locator('button:has-text("エクスポート実行")')
      .first();
    await expect(attendanceButton).toBeVisible();
    await attendanceButton.click();

    // ダウンロードが開始されることを確認
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('attendance_export');
    expect(download.suggestedFilename()).toContain('.csv');

    console.log('Download started:', download.suggestedFilename());
  });

  test('ユーザー情報のエクスポートが実際にダウンロードされる', async ({
    page,
  }) => {
    // システム管理者としてログイン
    await loginAsSystemAdmin(page);

    // エクスポートページに移動
    await page.goto('/system/export');
    await page.waitForLoadState('networkidle');

    // ダウンロードの開始を監視
    const downloadPromise = page.waitForEvent('download');

    // ユーザー情報のエクスポートボタンをクリック
    const userButton = page
      .locator('button:has-text("エクスポート実行")')
      .nth(1);
    await expect(userButton).toBeVisible();
    await userButton.click();

    // ダウンロードが開始されることを確認
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('users_export');
    expect(download.suggestedFilename()).toContain('.csv');

    console.log('Download started:', download.suggestedFilename());
  });

  test('施設情報のエクスポートが実際にダウンロードされる', async ({ page }) => {
    // システム管理者としてログイン
    await loginAsSystemAdmin(page);

    // エクスポートページに移動
    await page.goto('/system/export');
    await page.waitForLoadState('networkidle');

    // ダウンロードの開始を監視
    const downloadPromise = page.waitForEvent('download');

    // 施設情報のエクスポートボタンをクリック
    const facilityButton = page
      .locator('button:has-text("エクスポート実行")')
      .nth(2);
    await expect(facilityButton).toBeVisible();
    await facilityButton.click();

    // ダウンロードが開始されることを確認
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('facilities_export');
    expect(download.suggestedFilename()).toContain('.csv');

    console.log('Download started:', download.suggestedFilename());
  });

  test('すべてのエクスポートタイプのボタンが表示される', async ({ page }) => {
    // システム管理者としてログイン
    await loginAsSystemAdmin(page);

    // エクスポートページに移動
    await page.goto('/system/export');
    await page.waitForLoadState('networkidle');

    // 各エクスポートタイプのボタンが表示されていることを確認
    const exportButtons = page.locator('button:has-text("エクスポート実行")');
    await expect(exportButtons).toHaveCount(3);

    // 各カードのタイトルが表示されていることを確認
    await expect(
      page.locator('span:has-text("勤怠記録")').first()
    ).toBeVisible();
    await expect(
      page.locator('span:has-text("ユーザー情報")').first()
    ).toBeVisible();
    await expect(
      page.locator('span:has-text("施設情報")').first()
    ).toBeVisible();
  });

  test('エクスポートページのメタデータが正しい', async ({ page }) => {
    // システム管理者としてログイン
    await loginAsSystemAdmin(page);

    // エクスポートページに移動
    await page.goto('/system/export');
    await page.waitForLoadState('networkidle');

    // ページタイトルを確認（メタデータが正しく設定されているか確認）
    await expect(page.locator('h1')).toContainText('データエクスポート');

    // ページの説明文を確認（複数の要素があるため、最初のものを選択）
    await expect(
      page
        .locator(
          'p:has-text("勤怠記録、ユーザー情報、施設情報をCSV/Excel形式でエクスポートできます")'
        )
        .first()
    ).toBeVisible();
  });
});
