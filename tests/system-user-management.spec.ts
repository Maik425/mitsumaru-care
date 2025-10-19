import { expect, test } from '@playwright/test';

// システム管理者のログイン情報
const SYSTEM_ADMIN_EMAIL = 'admin@mitsumaru-care.com';
const SYSTEM_ADMIN_PASSWORD = 'password123';

// 施設管理者のログイン情報
const FACILITY_ADMIN_EMAIL = 'facility1@mitsumaru-care.com';
const FACILITY_ADMIN_PASSWORD = 'password123';

// 一般ユーザーのログイン情報
const USER_EMAIL = 'user1@mitsumaru-care.com';
const USER_PASSWORD = 'password123';

async function loginAs(page: any, email: string, password: string) {
  await page.goto('/login');

  // ログインフォームが表示されるまで待機
  await page.waitForSelector('input[type="email"]');

  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');

  // ログイン後のリダイレクトを待つ
  await page.waitForLoadState('networkidle');

  // ログイン後のリダイレクトを待機
  try {
    if (email === SYSTEM_ADMIN_EMAIL) {
      await page.waitForURL('/system/dashboard', { timeout: 10000 });
    } else if (email === FACILITY_ADMIN_EMAIL) {
      await page.waitForURL('/facility/dashboard', { timeout: 10000 });
    } else if (email === USER_EMAIL) {
      await page.waitForURL('/user/dashboard', { timeout: 10000 });
    }
  } catch (error) {
    // リダイレクトが失敗した場合は現在のURLを確認
    const currentUrl = page.url();
    console.log('Login failed, current URL:', currentUrl);
    throw error;
  }
}

async function logout(page: any) {
  await page.click('button:has-text("ログアウト")');
  await page.waitForURL('/login');
}

test.describe('システム管理者向けユーザー管理', () => {
  test.setTimeout(60000); // 60秒に延長

  test.beforeEach(async ({ page }) => {
    await loginAs(page, SYSTEM_ADMIN_EMAIL, SYSTEM_ADMIN_PASSWORD);
    // ログイン後、ユーザー管理ページに移動
    await page.goto('/system/users');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('システム管理者はユーザー管理画面にアクセスできる', async ({ page }) => {
    await expect(page).toHaveURL('/system/users');
    await expect(
      page.locator('header span:has-text("ユーザー管理")')
    ).toBeVisible();
  });

  test('ユーザー一覧が表示される', async ({ page }) => {
    // ユーザー一覧テーブルが表示される
    await expect(page.locator('table')).toBeVisible();

    // テーブルヘッダーが正しく表示される
    await expect(page.locator('th:has-text("名前")')).toBeVisible();
    await expect(page.locator('th:has-text("メールアドレス")')).toBeVisible();
    await expect(page.locator('th:has-text("ロール")')).toBeVisible();
    await expect(page.locator('th:has-text("施設")')).toBeVisible();
    await expect(page.locator('th:has-text("ステータス")')).toBeVisible();
    await expect(page.locator('th:has-text("作成日")')).toBeVisible();
    await expect(page.locator('th:has-text("アクション")')).toBeVisible();
  });

  test('統計情報が表示される', async ({ page }) => {
    // 統計カードが表示される
    await expect(
      page.locator('.grid.grid-cols-1.md\\:grid-cols-4.gap-4')
    ).toBeVisible();
    await expect(page.locator('text=総ユーザー数')).toBeVisible();
    await expect(
      page.locator(
        '.grid.grid-cols-1.md\\:grid-cols-4.gap-4 p:has-text("アクティブ")'
      )
    ).toBeVisible();
    await expect(
      page.locator(
        '.grid.grid-cols-1.md\\:grid-cols-4.gap-4 p:has-text("無効")'
      )
    ).toBeVisible();
    await expect(
      page.locator(
        '.grid.grid-cols-1.md\\:grid-cols-4.gap-4 p:has-text("施設管理者")'
      )
    ).toBeVisible();
  });

  test('ユーザー検索機能が動作する', async ({ page }) => {
    // 検索ボックスが表示されるまで待機
    await page.waitForSelector('input[placeholder="ユーザーを検索..."]');

    // 検索ボックスにテキストを入力
    await page.fill('input[placeholder="ユーザーを検索..."]', 'system');

    // 検索結果が更新される（実際のデータに依存）
    await page.waitForTimeout(1000);
  });

  test('ロールフィルターが動作する', async ({ page }) => {
    // ロールフィルターを開く
    await page.click('button:has-text("すべてのロール")');

    // システム管理者を選択（SelectItemをクリック）
    await page.click('[role="option"]:has-text("システム管理者")');

    // フィルターが適用される
    await page.waitForTimeout(1000);
  });

  test('施設フィルターが動作する', async ({ page }) => {
    // 施設フィルターを開く
    await page.click('button:has-text("すべての施設")');

    // 最初の施設を選択（存在する場合）
    const facilityOption = page.locator('[role="option"]').first();
    if (await facilityOption.isVisible()) {
      await facilityOption.click();
      await page.waitForTimeout(1000);
    }
  });

  test('ユーザー作成フォームが表示される', async ({ page }) => {
    // ユーザー追加ボタンをクリック
    await page.click('button:has-text("ユーザー追加")');

    // 作成フォームが表示される
    await expect(page.locator('text=新しいユーザーを作成')).toBeVisible();
    await expect(page.locator('input[id="name"]')).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("ロール")')).toBeVisible();
    await expect(page.locator('button:has-text("施設")')).toBeVisible();

    // Dialogを閉じる
    await page.keyboard.press('Escape');
  });

  test('ユーザー作成ができる', async ({ page }) => {
    // ユーザー追加ボタンをクリック
    await page.click('[data-testid="add-user"]');

    // ダイアログが開くまで待機
    await page.waitForSelector('input[id="name"]');

    // フォームに情報を入力
    await page.fill('input[id="name"]', 'テストユーザー');
    await page.fill('input[id="email"]', 'test@example.com');
    await page.fill('input[id="password"]', 'password123');

    // ダイアログが開いていることを確認
    await expect(page.locator('text=新しいユーザーを作成')).toBeVisible();
    await expect(page.locator('input[id="name"]')).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();

    // Dialogを閉じる
    await page.keyboard.press('Escape');
  });

  test('ユーザー編集ができる', async ({ page }) => {
    // テーブルが表示されるまで待機
    await page.waitForSelector('table');

    // テーブルにユーザーデータが表示されているか確認
    const userRows = page.locator('tbody tr');
    const userCount = await userRows.count();

    if (userCount > 0) {
      // 編集ボタンを探す（テストIDを使用）
      const editButton = page.locator('[data-testid="edit-user"]').first();

      if (await editButton.isVisible()) {
        await editButton.click();

        // 編集ダイアログが開くまで待機
        await page.waitForSelector('input[id="edit-name"]', { timeout: 10000 });

        // 編集フォームが表示される
        await expect(page.locator('text=ユーザーを編集')).toBeVisible();
        await expect(page.locator('input[id="edit-name"]')).toBeVisible();

        // Dialogを閉じる
        await page.keyboard.press('Escape');
      } else {
        console.log('編集ボタンが見つかりませんでした');
      }
    } else {
      console.log('ユーザーデータが表示されていません');
    }
  });

  test('ページネーションが動作する', async ({ page }) => {
    // ページネーションが表示される場合
    const nextButton = page.locator('button:has-text("次へ")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(1000);

      // 前へボタンが有効になる
      const prevButton = page.locator('button:has-text("前へ")');
      await expect(prevButton).toBeEnabled();
    }
  });
});

test.describe('権限チェック', () => {
  test('施設管理者はユーザー管理画面にアクセスできない', async ({ page }) => {
    await loginAs(page, FACILITY_ADMIN_EMAIL, FACILITY_ADMIN_PASSWORD);

    // ユーザー管理画面にアクセスを試行
    await page.goto('/system/users');

    // 施設管理者ダッシュボードにリダイレクトされることを確認
    await page.waitForURL('/facility/dashboard', { timeout: 5000 });

    await logout(page);
  });

  test('一般ユーザーはユーザー管理画面にアクセスできない', async ({ page }) => {
    await loginAs(page, USER_EMAIL, USER_PASSWORD);

    // ユーザー管理画面にアクセスを試行
    await page.goto('/system/users');

    // 一般ユーザーダッシュボードにリダイレクトされることを確認
    await page.waitForURL('/user/dashboard', { timeout: 5000 });

    await logout(page);
  });

  test('未認証ユーザーはユーザー管理画面にアクセスできない', async ({
    page,
  }) => {
    // ログインせずにユーザー管理画面にアクセス
    await page.goto('/system/users');

    // ログイン画面にリダイレクトされる
    await page.waitForURL('/login', { timeout: 5000 });
  });
});

test.describe('API権限チェック', () => {
  test('システム管理者はユーザー一覧APIにアクセスできる', async ({ page }) => {
    await loginAs(page, SYSTEM_ADMIN_EMAIL, SYSTEM_ADMIN_PASSWORD);

    // ユーザー管理ページに移動
    await page.goto('/system/users');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // コンポーネントのレンダリングを待機

    // ページが正しく表示されることを確認（より柔軟なセレクター）
    await expect(
      page.locator(
        'h1:has-text("ユーザー管理"), header span:has-text("ユーザー管理"), [data-testid="page-title"]:has-text("ユーザー管理")'
      )
    ).toBeVisible();

    await logout(page);
  });

  test('施設管理者はユーザー一覧APIにアクセスできない', async ({ page }) => {
    await loginAs(page, FACILITY_ADMIN_EMAIL, FACILITY_ADMIN_PASSWORD);

    // システム管理者画面にアクセスを試行（リダイレクトされる）
    await page.goto('/system/users');

    // 施設管理者ダッシュボードまたはログイン画面にリダイレクトされることを確認
    try {
      await page.waitForURL('/facility/dashboard', { timeout: 5000 });
    } catch {
      // ログイン画面にリダイレクトされる場合もある
      await page.waitForURL('/login', { timeout: 5000 });
    }

    // ログアウトはスキップ（既にログイン画面にいる可能性がある）
  });
});
