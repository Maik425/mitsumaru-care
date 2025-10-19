import { expect, test } from '@playwright/test';

test.describe('統一サイドバー機能', () => {
  // テスト用の認証情報
  const testUsers = {
    systemAdmin: {
      email: 'admin@mitsumaru-care.com',
      password: 'password123',
      role: 'system_admin',
    },
    facilityAdmin: {
      email: 'facility1@mitsumaru-care.com',
      password: 'password123',
      role: 'facility_admin',
    },
    user: {
      email: 'user1@mitsumaru-care.com',
      password: 'password123',
      role: 'user',
    },
  };

  // ログイン処理のヘルパー関数
  async function loginAs(page: any, userType: keyof typeof testUsers) {
    const user = testUsers[userType];
    await page.goto('/login');
    await page.fill('#email', user.email);
    await page.fill('#password', user.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // ログイン後のリダイレクトを待つ
    await page.waitForURL(
      /\/system\/dashboard|\/facility\/dashboard|\/user\/dashboard/,
      { timeout: 10000 }
    );
  }

  test.describe('システム管理者サイドバー', () => {
    test('システム管理者でログイン時に適切なサイドバーが表示される', async ({
      page,
    }) => {
      await loginAs(page, 'systemAdmin');
      // ログイン後は既に/system/dashboardにいるので、再度移動する必要はない

      // サイドバーが表示されることを確認
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

      // システム管理者画面のタイトルが表示されることを確認
      await expect(page.locator('text=システム管理者画面')).toBeVisible();

      // システム管理者専用メニューが表示されることを確認
      await expect(
        page.locator('[data-testid="sidebar"] a:has-text("ユーザー管理")')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="sidebar"] a:has-text("施設管理")')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="sidebar"] a:has-text("システム設定")')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="sidebar"] a:has-text("監査ログ")')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="sidebar"] a:has-text("ヘルスチェック")')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="sidebar"] a:has-text("データエクスポート")')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="sidebar"] a:has-text("通知管理")')
      ).toBeVisible();

      // 一般ユーザー用メニューが表示されないことを確認
      await expect(page.locator('text=勤怠申請')).not.toBeVisible();
      await expect(page.locator('text=希望休申請')).not.toBeVisible();
    });

    test('システム管理者メニューのナビゲーションが正常に動作する', async ({
      page,
    }) => {
      await loginAs(page, 'systemAdmin');
      // ログイン後は既に/system/dashboardにいるので、再度移動する必要はない

      // ユーザー管理メニューをクリック
      await page.click('[data-testid="sidebar"] a:has-text("ユーザー管理")');
      await page.waitForLoadState('networkidle');

      // ユーザー管理ページに遷移することを確認
      await expect(page).toHaveURL(/\/system\/users/);
      await expect(page.locator('h1:has-text("ユーザー管理")')).toBeVisible();
    });
  });

  test.describe('施設管理者サイドバー', () => {
    test('施設管理者でログイン時に適切なサイドバーが表示される', async ({
      page,
    }) => {
      await loginAs(page, 'facilityAdmin');
      // ログイン後は既に/facility/dashboardにいるので、再度移動する必要はない

      // サイドバーが表示されることを確認
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

      // 管理者画面のタイトルが表示されることを確認
      await expect(page.locator('text=管理者画面')).toBeVisible();

      // 施設管理者専用メニューが表示されることを確認
      await expect(
        page.locator('[data-testid="sidebar"] a:has-text("シフト詳細設定")')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="sidebar"] a:has-text("役割表管理")')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="sidebar"] a:has-text("シフト形態管理")')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="sidebar"] a:has-text("勤怠確認")')
      ).toBeVisible();

      // システム管理者専用メニューが表示されないことを確認
      await expect(page.locator('text=ユーザー管理')).not.toBeVisible();
      await expect(page.locator('text=監査ログ')).not.toBeVisible();
    });

    test('施設管理者メニューのナビゲーションが正常に動作する', async ({
      page,
    }) => {
      await loginAs(page, 'facilityAdmin');
      // ログイン後は既に/facility/dashboardにいるので、再度移動する必要はない

      // シフト詳細設定メニューをクリック
      await page.click('[data-testid="sidebar"] a:has-text("シフト詳細設定")');
      await page.waitForLoadState('networkidle');

      // シフト詳細設定ページに遷移することを確認
      await expect(page).toHaveURL(/\/facility\/shift\/create/);
    });
  });

  test.describe('一般ユーザーサイドバー', () => {
    test('一般ユーザーでログイン時に適切なサイドバーが表示される', async ({
      page,
    }) => {
      await loginAs(page, 'user');
      // ログイン後は既に/user/dashboardにいるので、再度移動する必要はない

      // サイドバーが表示されることを確認
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

      // 一般職画面のタイトルが表示されることを確認
      await expect(page.locator('text=一般職画面')).toBeVisible();

      // 一般ユーザー専用メニューが表示されることを確認
      await expect(
        page.locator('[data-testid="sidebar"] a:has-text("ダッシュボード")')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="sidebar"] a:has-text("勤怠申請")')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="sidebar"] a:has-text("希望休申請")')
      ).toBeVisible();

      // 管理者専用メニューが表示されないことを確認
      await expect(page.locator('text=シフト管理')).not.toBeVisible();
      await expect(page.locator('text=ユーザー管理')).not.toBeVisible();
    });

    test('一般ユーザーメニューのナビゲーションが正常に動作する', async ({
      page,
    }) => {
      await loginAs(page, 'user');
      // ログイン後は既に/user/dashboardにいるので、再度移動する必要はない

      // 勤怠申請メニューをクリック
      await page.click('[data-testid="sidebar"] a:has-text("勤怠申請")');
      await page.waitForLoadState('networkidle');

      // 勤怠申請ページに遷移することを確認
      await expect(page).toHaveURL(/\/user\/attendance/);
      await expect(page.locator('h1:has-text("勤怠申請")')).toBeVisible();
    });
  });

  test.describe('共通機能', () => {
    test('全ロールでFAQメニューが表示される', async ({ page }) => {
      // システム管理者で確認
      await loginAs(page, 'systemAdmin');
      await expect(
        page.locator('[data-testid="sidebar"] a:has-text("FAQ")')
      ).toBeVisible();

      // 施設管理者で確認
      await loginAs(page, 'facilityAdmin');
      await expect(
        page.locator('[data-testid="sidebar"] a:has-text("FAQ")')
      ).toBeVisible();

      // 一般ユーザーで確認
      await loginAs(page, 'user');
      await expect(
        page.locator('[data-testid="sidebar"] a:has-text("FAQ")')
      ).toBeVisible();
    });

    test('全ロールでログアウトボタンが表示される', async ({ page }) => {
      // システム管理者で確認
      await loginAs(page, 'systemAdmin');
      await expect(
        page.locator('[data-testid="sidebar"] button:has-text("ログアウト")')
      ).toBeVisible();

      // 施設管理者で確認
      await loginAs(page, 'facilityAdmin');
      await expect(
        page.locator('[data-testid="sidebar"] button:has-text("ログアウト")')
      ).toBeVisible();

      // 一般ユーザーで確認
      await loginAs(page, 'user');
      await expect(
        page.locator('[data-testid="sidebar"] button:has-text("ログアウト")')
      ).toBeVisible();
    });

    test('ログアウト機能が正常に動作する', async ({ page }) => {
      await loginAs(page, 'user');
      // ログイン後は既に/user/dashboardにいるので、再度移動する必要はない

      // ログアウトボタンをクリック
      await page.click('[data-testid="sidebar"] button:has-text("ログアウト")');
      await page.waitForLoadState('networkidle');

      // ログインページにリダイレクトされることを確認
      await expect(page).toHaveURL(/\/login/);
    });

    test('アクティブメニューのハイライトが正常に動作する', async ({ page }) => {
      await loginAs(page, 'user');
      // ログイン後は既に/user/dashboardにいるので、再度移動する必要はない

      // ダッシュボードメニューがアクティブ状態であることを確認
      const dashboardMenu = page.locator(
        '[data-testid="sidebar"] a:has-text("ダッシュボード")'
      );
      await expect(dashboardMenu).toHaveClass(/active/);

      // 勤怠申請ページに移動
      await page.click('[data-testid="sidebar"] a:has-text("勤怠申請")');
      await page.waitForLoadState('networkidle');

      // 勤怠申請メニューがアクティブ状態であることを確認
      const attendanceMenu = page.locator(
        '[data-testid="sidebar"] a:has-text("勤怠申請")'
      );
      await expect(attendanceMenu).toHaveClass(/active/);
    });
  });

  test.describe('レスポンシブ対応', () => {
    test('モバイル表示でサイドバーが適切に表示される', async ({ page }) => {
      // モバイルサイズに設定
      await page.setViewportSize({ width: 375, height: 667 });

      await loginAs(page, 'user');
      // ログイン後は既に/user/dashboardにいるので、再度移動する必要はない

      // サイドバートリガーが表示されることを確認
      await expect(
        page.locator('[data-testid="sidebar-trigger"]')
      ).toBeVisible();

      // サイドバートリガーをクリック
      await page.click('[data-testid="sidebar-trigger"]');

      // サイドバーが表示されることを確認
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    });
  });

  test.describe('権限チェック', () => {
    test('未認証ユーザーはサイドバーにアクセスできない', async ({ page }) => {
      // ログインせずにダッシュボードにアクセス
      await page.goto('/user/dashboard');

      // ログインページにリダイレクトされることを確認
      await expect(page).toHaveURL(/\/login/);
    });

    test('権限のないページにアクセスした場合の動作', async ({ page }) => {
      await loginAs(page, 'user');

      // 一般ユーザーがシステム管理者ページにアクセス
      await page.goto('/system/dashboard');

      // アクセス権限がないメッセージが表示されることを確認
      await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
    });
  });
});
