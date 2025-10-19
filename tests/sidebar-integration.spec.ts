import { expect, test } from '@playwright/test';

test.describe('統一サイドバー統合テスト', () => {
  test('全ロールでサイドバーが正常に動作する', async ({ page }) => {
    const testUsers = [
      {
        email: 'admin@mitsumaru-care.com',
        password: 'password123',
        role: 'system_admin',
        dashboardUrl: '/system/dashboard',
        expectedMenus: [
          'ユーザー管理',
          'システム管理',
          '監査ログ',
          'ヘルスチェック',
          'データエクスポート',
          '通知管理',
        ],
        unexpectedMenus: ['勤怠申請', '希望休申請', 'シフト管理'],
      },
      {
        email: 'facility1@mitsumaru-care.com',
        password: 'password123',
        role: 'facility_admin',
        dashboardUrl: '/facility/dashboard',
        expectedMenus: ['シフト管理', '役割表管理', '各種登録管理', '勤怠確認'],
        unexpectedMenus: ['ユーザー管理', '監査ログ', '勤怠申請', '希望休申請'],
      },
      {
        email: 'user1@mitsumaru-care.com',
        password: 'password123',
        role: 'user',
        dashboardUrl: '/user/dashboard',
        expectedMenus: ['ダッシュボード', '勤怠申請', '希望休申請'],
        unexpectedMenus: ['ユーザー管理', 'シフト管理', '監査ログ'],
      },
    ];

    for (const user of testUsers) {
      // ログイン
      await page.goto('/login');
      await page.fill('#email', user.email);
      await page.fill('#password', user.password);
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle', { timeout: 10000 });

      // ダッシュボードに移動
      await page.goto(user.dashboardUrl);

      // サイドバーが表示されることを確認
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

      // 期待されるメニューが表示されることを確認
      for (const menu of user.expectedMenus) {
        await expect(page.locator(`text=${menu}`)).toBeVisible();
      }

      // 期待されないメニューが表示されないことを確認
      for (const menu of user.unexpectedMenus) {
        await expect(page.locator(`text=${menu}`)).not.toBeVisible();
      }

      // 共通メニューが表示されることを確認
      await expect(page.locator('text=FAQ')).toBeVisible();
      await expect(page.locator('text=ログアウト')).toBeVisible();

      // ログアウト
      await page.click('text=ログアウト');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('メニューナビゲーションが全ロールで正常に動作する', async ({ page }) => {
    const navigationTests = [
      {
        user: {
          email: 'admin@mitsumaru-care.com',
          password: 'password123',
        },
        tests: [
          { menu: 'ユーザー管理', expectedUrl: /\/system\/users/ },
          { menu: 'FAQ', expectedUrl: /\/faq/ },
        ],
      },
      {
        user: {
          email: 'facility1@mitsumaru-care.com',
          password: 'password123',
        },
        tests: [
          { menu: 'シフト詳細設定', expectedUrl: /\/facility\/shift\/create/ },
          { menu: '勤怠確認', expectedUrl: /\/facility\/attendance/ },
        ],
      },
      {
        user: {
          email: 'user1@mitsumaru-care.com',
          password: 'password123',
        },
        tests: [
          { menu: '勤怠申請', expectedUrl: /\/user\/attendance/ },
          { menu: '希望休申請', expectedUrl: /\/user\/holidays/ },
        ],
      },
    ];

    for (const testGroup of navigationTests) {
      // ログイン
      await page.goto('/login');
      await page.fill('#email', testGroup.user.email);
      await page.fill('#password', testGroup.user.password);
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle', { timeout: 10000 });

      // 各メニューのナビゲーションテスト
      for (const navTest of testGroup.tests) {
        // ダッシュボードに移動
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // メニューをクリック
        await page.click(`text=${navTest.menu}`);
        await page.waitForLoadState('networkidle');

        // 期待されるURLに遷移することを確認
        await expect(page).toHaveURL(navTest.expectedUrl);
      }

      // ログアウト
      await page.click('text=ログアウト');
      await page.waitForLoadState('networkidle');
    }
  });

  test('レスポンシブデザインが正常に動作する', async ({ page }) => {
    // デスクトップサイズでテスト
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto('/login');
    await page.fill('#email', 'user1@mitsumaru-care.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    await page.goto('/user/dashboard');

    // デスクトップではサイドバーが常に表示される
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

    // モバイルサイズに変更
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // モバイルではサイドバートリガーが表示される
    await expect(page.locator('[data-testid="sidebar-trigger"]')).toBeVisible();

    // サイドバートリガーをクリック
    await page.click('[data-testid="sidebar-trigger"]');

    // サイドバーが表示されることを確認
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
  });

  test('アクティブメニューの状態が正しく更新される', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'user1@mitsumaru-care.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // ダッシュボードページに移動
    await page.goto('/user/dashboard');
    await page.waitForLoadState('networkidle');

    // ダッシュボードメニューがアクティブ状態であることを確認
    const dashboardMenu = page.locator('text=ダッシュボード').first();
    await expect(dashboardMenu).toHaveClass(/active/);

    // 勤怠申請ページに移動
    await page.click('text=勤怠申請');
    await page.waitForLoadState('networkidle');

    // 勤怠申請メニューがアクティブ状態であることを確認
    const attendanceMenu = page.locator('text=勤怠申請').first();
    await expect(attendanceMenu).toHaveClass(/active/);

    // ダッシュボードメニューが非アクティブ状態であることを確認
    await expect(dashboardMenu).not.toHaveClass(/active/);
  });

  test('エラーハンドリングが正常に動作する', async ({ page }) => {
    // 無効な認証情報でログイン試行
    await page.goto('/login');
    await page.fill('#email', 'invalid@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // ログインページに留まることを確認
    await expect(page).toHaveURL(/\/login/);

    // 認証されていない状態でダッシュボードにアクセス
    await page.goto('/user/dashboard');

    // アクセス権限がないメッセージが表示されることを確認
    await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
  });
});
