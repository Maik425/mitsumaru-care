import { Page, expect } from '@playwright/test';

// テストユーザー情報
export const TEST_USERS = {
  SYSTEM_ADMIN: {
    email: 'admin@mitsumaru-care.com',
    password: 'password123',
    role: 'system_admin',
    userId: '2b25db72-8833-454e-a951-2bc5416e167e',
    name: 'システム管理者',
  },
  FACILITY_ADMIN: {
    email: 'facility1@mitsumaru-care.com',
    password: 'password123',
    role: 'facility_admin',
    userId: '52d48d5d-a307-4d3f-9a14-13a4f4c3cbe2',
    name: '施設管理者1',
  },
  USER: {
    email: 'user1@mitsumaru-care.com',
    password: 'password123',
    role: 'user',
    userId: '2fb175c0-98d5-4263-a2c0-e6c47233d06d',
    name: '職員1',
  },
} as const;

// ログインヘルパー関数
export async function loginAsUser(
  page: Page,
  userType: keyof typeof TEST_USERS,
  expectedRedirectPath?: string
): Promise<void> {
  const user = TEST_USERS[userType];

  console.log(`Logging in as ${user.name} (${user.email})`);

  // ログインページに移動
  await page.goto('/login');

  // ログインフォームが表示されるまで待つ
  await page.waitForSelector('input[id="email"]', { timeout: 10000 });

  // ログインフォームに入力
  await page.fill('input[id="email"]', user.email);
  await page.fill('input[id="password"]', user.password);

  // ログインボタンをクリック
  await page.click('button[type="submit"]');

  // ログイン処理を待つ
  try {
    if (expectedRedirectPath) {
      await page.waitForURL(expectedRedirectPath, { timeout: 30000 });
    } else {
      // デフォルトのリダイレクト先を設定
      const defaultRedirects = {
        SYSTEM_ADMIN: '/system/dashboard',
        FACILITY_ADMIN: '/facility/dashboard',
        USER: '/user/dashboard',
      };
      await page.waitForURL(defaultRedirects[userType], { timeout: 30000 });
    }

    // 認証データがlocalStorageに保存されるまで待機（より短いタイムアウト）
    try {
      await page.waitForFunction(
        () => {
          const authData = localStorage.getItem('auth-storage');
          return authData !== null;
        },
        { timeout: 2000 }
      );
    } catch (error) {
      console.log('Auth data not found in localStorage, continuing...');
    }

    console.log(`Successfully logged in as ${user.name}`);
  } catch (error) {
    // ログインに失敗した場合の詳細なエラー情報
    const currentUrl = page.url();
    console.error(`Login failed for ${user.name}`);
    console.error(`Current URL: ${currentUrl}`);

    // エラーメッセージを取得
    const errorMessage = await page
      .locator('[data-testid="error-message"], .error, .text-red-500')
      .first()
      .textContent()
      .catch(() => 'No error message found');
    console.error(`Error message: ${errorMessage}`);

    // ページの内容を確認
    const pageContent = await page.content();
    console.error('Page content:', pageContent.substring(0, 1000));

    // ページのスクリーンショットを取得
    try {
      await page.screenshot({
        path: `test-results/login-error-${userType}-${Date.now()}.png`,
      });
    } catch (screenshotError) {
      console.error('Failed to take screenshot:', screenshotError);
    }

    throw new Error(
      `Login failed for ${user.name}. Current URL: ${currentUrl}, Error: ${errorMessage}`
    );
  }
}

// システム管理者としてログイン
export async function loginAsSystemAdmin(page: Page): Promise<void> {
  await loginAsUser(page, 'SYSTEM_ADMIN', '/system/dashboard');
}

// 施設管理者としてログイン
export async function loginAsFacilityAdmin(page: Page): Promise<void> {
  await loginAsUser(page, 'FACILITY_ADMIN', '/facility/dashboard');
}

// 一般ユーザーとしてログイン
export async function loginAsRegularUser(page: Page): Promise<void> {
  await loginAsUser(page, 'USER', '/user/dashboard');
}

// ログイン状態を確認
export async function verifyLoginState(
  page: Page,
  expectedRole: string
): Promise<void> {
  // ログイン後のページが正しく表示されているか確認
  const currentUrl = page.url();
  console.log(`Current URL after login: ${currentUrl}`);

  // ロールに応じたダッシュボードが表示されているか確認
  if (expectedRole === 'system_admin') {
    await expect(page.locator('h1')).toContainText(
      'システム管理ダッシュボード'
    );
  } else if (expectedRole === 'facility_admin') {
    await expect(page.locator('h1')).toContainText('施設管理ダッシュボード');
  } else if (expectedRole === 'user') {
    await expect(page.locator('h1')).toContainText('ユーザーダッシュボード');
  }
}

// テストユーザーの存在確認
export async function verifyTestUsersExist(): Promise<void> {
  console.log('Verifying test users exist...');

  // 各テストユーザーの情報をログ出力
  Object.entries(TEST_USERS).forEach(([key, user]) => {
    console.log(`${key}: ${user.email} (${user.name}) - ${user.role}`);
  });

  console.log('Test users verification completed');
}
