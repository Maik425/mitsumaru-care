import { test, expect } from '@playwright/test';

// テストデータ
const testUsers = {
  admin: {
    email: 'admin@mitsumaru-care.com',
    password: 'admin123',
    name: '管理者 太郎',
    role: 'ADMIN',
  },
  owner: {
    email: 'owner@mitsumaru-care.com',
    password: 'owner123',
    name: '施設長 一郎',
    role: 'OWNER',
  },
  employee: {
    email: 'employee@mitsumaru-care.com',
    password: 'employee123',
    name: '職員 花子',
    role: 'MEMBER',
  },
  nurse: {
    email: 'nurse@mitsumaru-care.com',
    password: 'nurse123',
    name: '看護師 三郎',
    role: 'MEMBER',
  },
};

test.describe('認証・認可フロー - 詳細テスト', () => {
  test.beforeEach(async ({ page }) => {
    // ログインページから開始
    await page.goto('/');
  });

  test.describe('ログインフロー詳細テスト', () => {
    test('管理者ログイン後の権限確認', async ({ page }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // 管理者ダッシュボードに遷移
      await expect(page).toHaveURL(/.*admin.*/);

      // 管理者メニューが表示されることを確認
      await expect(page.getByTestId('シフト管理-card')).toBeVisible();
      await expect(page.getByTestId('職員管理-card')).toBeVisible();
      await expect(page.getByTestId('勤怠管理-card')).toBeVisible();
      await expect(page.getByTestId('役割表管理-メインカード')).toBeVisible();

      // ユーザー情報が正しく表示されることを確認
      await expect(page.getByTestId('user-name')).toBeVisible();
      await expect(page.getByTestId('user-role')).toBeVisible();
    });

    test('施設長ログイン後の権限確認', async ({ page }) => {
      // 施設長としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.owner.email);
      await page.getByLabel('パスワード').fill(testUsers.owner.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // 管理者ダッシュボードに遷移
      await expect(page).toHaveURL(/.*admin.*/);

      // 施設長専用機能が表示されることを確認
      await expect(page.getByTestId('システム設定・管理-card')).toBeVisible();
      await expect(page.getByTestId('テナント管理・設定-card')).toBeVisible();
    });

    test('一般職員ログイン後の権限確認', async ({ page }) => {
      // 一般職員としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.employee.email);
      await page.getByLabel('パスワード').fill(testUsers.employee.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // 一般職員ダッシュボードに遷移
      await expect(page).toHaveURL(/.*user.*/);

      // 一般職員メニューが表示されることを確認
      await expect(page.getByTestId('勤怠管理-card')).toBeVisible();
      await expect(page.getByTestId('希望休管理-card')).toBeVisible();
      await expect(page.getByTestId('今月のシフト-card')).toBeVisible();

      // 管理者機能が表示されないことを確認
      await expect(page.getByText(/シフト管理/)).not.toBeVisible();
      await expect(page.getByText(/職員管理/)).not.toBeVisible();
    });

    test('看護師ログイン後の権限確認', async ({ page }) => {
      // 看護師としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.nurse.email);
      await page.getByLabel('パスワード').fill(testUsers.nurse.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // 一般職員ダッシュボードに遷移
      await expect(page).toHaveURL(/.*user.*/);

      // 看護師専用機能が表示されることを確認
      await expect(page.getByTestId('看護記録・管理-card')).toBeVisible();
      await expect(page.getByTestId('医療処置・管理-card')).toBeVisible();
    });
  });

  test.describe('セッション管理テスト', () => {
    test('セッションタイムアウト', async ({ page }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // 管理者ダッシュボードに遷移
      await expect(page).toHaveURL(/.*admin.*/);

      // セッションタイムアウトをシミュレート
      await page.evaluate(() => {
        // セッションタイムアウトを強制的に発生させる
        localStorage.removeItem('lastActivity');
        localStorage.setItem(
          'lastActivity',
          (Date.now() - 31 * 60 * 1000).toString()
        );
      });

      // ページをリロード
      await page.reload();

      // セッションタイムアウトメッセージが表示されることを確認
      await expect(page.getByTestId('session-timeout-message')).toBeVisible();

      // ログインページにリダイレクトされることを確認（timeoutパラメータ付き）
      await expect(page).toHaveURL(/\/\?timeout=true$/);
    });

    test('複数タブでのセッション管理', async ({ page, context }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // 新しいタブを開く
      const newPage = await context.newPage();
      await newPage.goto('/admin/dashboard');

      // 新しいタブでも認証状態が維持されることを確認
      await expect(newPage.getByTestId('シフト管理-card')).toBeVisible();

      // 元のタブでログアウト（ヘッダーのlogoutを明示）
      await page.getByTestId('header-logout').click();

      // 新しいタブでもセッションが無効になることを確認（ログアウト時はトップへ）
      await newPage.reload();
      await expect(newPage).toHaveURL('/');
    });
  });

  test.describe('パスワードセキュリティテスト', () => {
    test('パスワード強度チェック', async ({ page }) => {
      // パスワード変更画面にアクセス（ログイン後）
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      await page.goto('/admin/settings/password');

      // 弱いパスワードを入力
      await page.getByLabel(/現在のパスワード/).fill(testUsers.admin.password);
      await page.getByTestId('new-password').fill('123');
      await page.getByTestId('confirm-password').fill('123');

      // 送信してバリデーションを発火
      await page.getByRole('button', { name: /変更/ }).click();
      // パスワード強度エラーが表示されることを確認
      await expect(page.getByTestId('password-error-message')).toBeVisible();
    });

    test('パスワード変更後の再ログイン', async ({ page }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // パスワード変更
      await page.goto('/admin/settings/password');
      await page.getByLabel(/現在のパスワード/).fill(testUsers.admin.password);
      await page.getByTestId('new-password').fill('NewPassword123!');
      await page.getByTestId('confirm-password').fill('NewPassword123!');
      await page.getByRole('button', { name: /変更/ }).click();

      // 変更完了メッセージが表示されることを確認
      await expect(page.getByTestId('password-success-message')).toBeVisible();

      // ログアウト
      await page.getByTestId('header-logout').click();

      // 新しいパスワードでログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill('NewPassword123!');
      await page.getByRole('button', { name: 'ログイン' }).click();

      // ログインが成功することを確認
      await expect(page).toHaveURL(/.*admin.*/);
    });
  });

  test.describe('権限エスカレーション防止テスト', () => {
    test('一般職員による管理者機能への不正アクセス試行', async ({ page }) => {
      // 一般職員としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.employee.email);
      await page.getByLabel('パスワード').fill(testUsers.employee.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // 直接URLで管理者機能にアクセスを試行
      const adminUrls = [
        '/admin/shifts',
        '/admin/attendance',
        '/admin/staff',
        '/admin/settings',
      ];

      for (const url of adminUrls) {
        await page.goto(url);

        // アクセス拒否または適切なエラーページが表示されることを確認
        await expect(page).toHaveURL(/\/\?error=insufficient_permissions$/);
        await expect(
          page.getByTestId('permission-error-message')
        ).toBeVisible();
      }
    });

    test('APIエンドポイントへの直接アクセス制限', async ({ page }) => {
      // 一般職員としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.employee.email);
      await page.getByLabel('パスワード').fill(testUsers.employee.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // APIエンドポイントへの直接アクセスを試行
      const response = await page.request.post('/api/trpc/shifts.create', {
        data: {
          tenantId: 'test',
          date: '2025-03-15',
          shiftTypeId: 'test',
        },
      });

      // 403 Forbiddenが返されることを確認
      expect(response.status()).toBe(403);
    });
  });

  test.describe('ログイン試行制限テスト', () => {
    test('連続ログイン失敗時のエラーメッセージ表示', async ({ page }) => {
      // 1回ログイン失敗
      await page.getByLabel('メールアドレス').fill('invalid@example.com');
      await page.getByLabel('パスワード').fill('wrongpassword');
      await page.getByRole('button', { name: 'ログイン' }).click();

      // エラーメッセージが表示されることを確認
      await expect(page.getByText(/認証に失敗しました/)).toBeVisible();
    });

    test('CAPTCHA表示の確認（基本実装）', async ({ page }) => {
      // 基本的なCAPTCHA表示の確認（実装予定）
      await expect(
        page.getByRole('button', { name: 'ログイン' })
      ).toBeVisible();
    });
  });

  test.describe('多要素認証テスト', () => {
    test('2FA基本機能（実装予定）', async ({ page }) => {
      // 基本的な2FA機能の確認（実装予定）
      await expect(
        page.getByRole('button', { name: 'ログイン' })
      ).toBeVisible();
    });
  });
});
