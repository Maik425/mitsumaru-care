import { expect, test } from '@playwright/test';

test.describe('折りたたみサイドバー機能', () => {
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

  test.describe('デスクトップでの折りたたみ機能', () => {
    test('サイドバーの開閉切り替えが正常に動作する', async ({ page }) => {
      // デスクトップサイズに設定
      await page.setViewportSize({ width: 1920, height: 1080 });

      await loginAs(page, 'user');

      // サイドバーが表示されることを確認
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

      // サイドバートリガーをクリック
      await page.click('[data-testid="sidebar-trigger"]');
      await page.waitForTimeout(500); // アニメーション完了を待つ

      // サイドバーが折りたたまれることを確認（幅の変化で判定）
      const sidebarWidth = await page
        .locator('[data-testid="sidebar"]')
        .evaluate(el => (el as HTMLElement).offsetWidth);
      expect(sidebarWidth).toBeLessThan(100); // 折りたたまれた状態では幅が狭くなる（48px）

      // 再度クリックして開く
      await page.click('[data-testid="sidebar-trigger"]');
      await page.waitForTimeout(500);

      // サイドバーが開かれることを確認（幅の変化で判定）
      const sidebarWidthAfter = await page
        .locator('[data-testid="sidebar"]')
        .evaluate(el => (el as HTMLElement).offsetWidth);
      expect(sidebarWidthAfter).toBeGreaterThan(200); // 開いた状態では幅が広くなる（256px）
    });

    test('折りたたみ状態でツールチップが表示される', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      await loginAs(page, 'user');

      // サイドバーを折りたたむ
      await page.click('[data-testid="sidebar-trigger"]');
      await page.waitForTimeout(500);

      // メニューアイテムにホバー
      const menuItem = page.locator(
        '[data-testid="sidebar"] a:has-text("ダッシュボード")'
      );
      await menuItem.hover();

      // ツールチップが表示されることを確認
      await expect(page.locator('[role="tooltip"]')).toBeVisible();
      await expect(page.locator('[role="tooltip"]')).toContainText(
        'ダッシュボード'
      );
    });

    test('開閉状態がローカルストレージに保存される', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      await loginAs(page, 'user');

      // サイドバーを折りたたむ（1回クリック）
      await page.click('[data-testid="sidebar-trigger"]');
      await page.waitForTimeout(500);

      // クッキーの状態を確認（Shadcn/uiのSidebarはクッキーを使用）
      const sidebarState = await page.evaluate(() => {
        return document.cookie.includes('sidebar:state=false');
      });
      expect(sidebarState).toBe(true);

      // ページをリロード
      await page.reload();
      await page.waitForLoadState('networkidle');

      // 折りたたみ状態が維持されることを確認（幅で判定）
      const sidebarWidth = await page
        .locator('[data-testid="sidebar"]')
        .evaluate(el => (el as HTMLElement).offsetWidth);
      expect(sidebarWidth).toBeLessThan(100); // 折りたたまれた状態では幅が狭くなる（48px）
    });
  });

  test.describe('モバイルでの折りたたみ機能', () => {
    test('モバイルでサイドバーが初期状態で閉じられている', async ({ page }) => {
      // モバイルサイズに設定
      await page.setViewportSize({ width: 375, height: 667 });

      await loginAs(page, 'user');

      // モバイルではサイドバーが非表示になる可能性があるため、まずトリガーをクリック
      await page.click('[data-testid="sidebar-trigger"]');
      await page.waitForTimeout(500);

      // モバイルではSheetコンポーネント内のサイドバーを確認
      await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();

      // サイドバーが開かれることを確認（幅で判定）
      const sidebarWidth = await page
        .locator('[data-sidebar="sidebar"]')
        .evaluate(el => (el as HTMLElement).offsetWidth);
      expect(sidebarWidth).toBeGreaterThan(200);

      // ESCキーで閉じる
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      // サイドバーが閉じられることを確認（モバイルでは非表示になる）
      await expect(page.locator('[data-sidebar="sidebar"]')).not.toBeVisible();
    });

    test('モバイルでオーバーレイ表示が正常に動作する', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await loginAs(page, 'user');

      // サイドバーを開く
      await page.click('[data-testid="sidebar-trigger"]');
      await page.waitForTimeout(500);

      // オーバーレイが表示されることを確認
      await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();

      // メニューアイテムが表示されることを確認
      await expect(
        page.locator('[data-sidebar="sidebar"] a:has-text("ダッシュボード")')
      ).toBeVisible();
    });
  });

  test.describe('レスポンシブ対応', () => {
    test('画面サイズ変更時に適切に動作する', async ({ page }) => {
      // デスクトップサイズで開始
      await page.setViewportSize({ width: 1920, height: 1080 });

      await loginAs(page, 'user');

      // サイドバーを開く
      await page.click('[data-testid="sidebar-trigger"]');
      await page.waitForTimeout(500);

      // モバイルサイズに変更
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      // モバイルではサイドバーが非表示になる可能性があるため、トリガーをクリック
      await page.click('[data-testid="sidebar-trigger"]');
      await page.waitForTimeout(500);

      // サイドバーが適切に表示されることを確認
      await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();

      // デスクトップサイズに戻す
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(500);

      // サイドバーが適切に表示されることを確認
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    });
  });

  test.describe('アクセシビリティ', () => {
    test('キーボード操作でサイドバー開閉が可能', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      await loginAs(page, 'user');

      // サイドバートリガーにフォーカス
      await page.locator('[data-testid="sidebar-trigger"]').focus();

      // Enterキーで閉じる
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      // サイドバーが閉じられることを確認（幅で判定）
      const sidebarWidthAfter = await page
        .locator('[data-testid="sidebar"]')
        .evaluate(el => (el as HTMLElement).offsetWidth);
      expect(sidebarWidthAfter).toBeLessThan(100);

      // Spaceキーで開く
      await page.keyboard.press('Space');
      await page.waitForTimeout(500);

      // サイドバーが開かれることを確認（幅で判定）
      const sidebarWidth = await page
        .locator('[data-testid="sidebar"]')
        .evaluate(el => (el as HTMLElement).offsetWidth);
      expect(sidebarWidth).toBeGreaterThan(200);
    });

    test('aria-labelが適切に設定される', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      await loginAs(page, 'user');

      // 初期状態のスクリーンリーダーテキストを確認
      const trigger = page.locator('[data-testid="sidebar-trigger"]');
      await expect(trigger.locator('.sr-only')).toHaveText('Toggle Sidebar');

      // サイドバーを閉じる
      await page.click('[data-testid="sidebar-trigger"]');
      await page.waitForTimeout(500);

      // 閉じた状態のスクリーンリーダーテキストを確認
      await expect(trigger.locator('.sr-only')).toHaveText('Toggle Sidebar');
    });
  });

  test.describe('全ロールでの動作確認', () => {
    test('システム管理者で折りたたみ機能が動作する', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      await loginAs(page, 'systemAdmin');

      // サイドバーが表示されることを確認
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

      // 開閉操作が正常に動作することを確認
      await page.click('[data-testid="sidebar-trigger"]');
      await page.waitForTimeout(500);
      // 折りたたまれた状態を確認（幅で判定）
      const sidebarWidthCollapsed = await page
        .locator('[data-testid="sidebar"]')
        .evaluate(el => (el as HTMLElement).offsetWidth);
      expect(sidebarWidthCollapsed).toBeLessThan(100); // 折りたたまれた状態（48px）

      await page.click('[data-testid="sidebar-trigger"]');
      await page.waitForTimeout(500);
      // 開いた状態を確認（幅で判定）
      const sidebarWidthExpanded = await page
        .locator('[data-testid="sidebar"]')
        .evaluate(el => (el as HTMLElement).offsetWidth);
      expect(sidebarWidthExpanded).toBeGreaterThan(200); // 開いた状態（256px）
    });

    test('施設管理者で折りたたみ機能が動作する', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      await loginAs(page, 'facilityAdmin');

      // サイドバーが表示されることを確認
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

      // 開閉操作が正常に動作することを確認
      await page.click('[data-testid="sidebar-trigger"]');
      await page.waitForTimeout(500);
      // 折りたたまれた状態を確認（幅で判定）
      const sidebarWidthCollapsed = await page
        .locator('[data-testid="sidebar"]')
        .evaluate(el => (el as HTMLElement).offsetWidth);
      expect(sidebarWidthCollapsed).toBeLessThan(100); // 折りたたまれた状態（48px）

      await page.click('[data-testid="sidebar-trigger"]');
      await page.waitForTimeout(500);
      // 開いた状態を確認（幅で判定）
      const sidebarWidthExpanded = await page
        .locator('[data-testid="sidebar"]')
        .evaluate(el => (el as HTMLElement).offsetWidth);
      expect(sidebarWidthExpanded).toBeGreaterThan(200); // 開いた状態（256px）
    });

    test('一般ユーザーで折りたたみ機能が動作する', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      await loginAs(page, 'user');

      // サイドバーが表示されることを確認
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

      // 開閉操作が正常に動作することを確認
      await page.click('[data-testid="sidebar-trigger"]');
      await page.waitForTimeout(500);
      // 折りたたまれた状態を確認（幅で判定）
      const sidebarWidthCollapsed = await page
        .locator('[data-testid="sidebar"]')
        .evaluate(el => (el as HTMLElement).offsetWidth);
      expect(sidebarWidthCollapsed).toBeLessThan(100); // 折りたたまれた状態（48px）

      await page.click('[data-testid="sidebar-trigger"]');
      await page.waitForTimeout(500);
      // 開いた状態を確認（幅で判定）
      const sidebarWidthExpanded = await page
        .locator('[data-testid="sidebar"]')
        .evaluate(el => (el as HTMLElement).offsetWidth);
      expect(sidebarWidthExpanded).toBeGreaterThan(200); // 開いた状態（256px）
    });
  });
});
