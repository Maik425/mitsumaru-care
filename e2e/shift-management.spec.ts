import { test, expect } from '@playwright/test';

// テストデータ
const testUsers = {
  admin: {
    email: 'admin@mitsumaru-care.com',
    password: 'admin123',
    name: '管理者 太郎',
  },
  employee: {
    email: 'employee@mitsumaru-care.com',
    password: 'employee123',
    name: '職員 花子',
  },
};

test.describe('みつまるケアシステム - E2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    // ログインページから開始
    await page.goto('/');
  });

  test.describe('認証フロー (UC-COM-001)', () => {
    test('正常なログイン - 管理者', async ({ page }) => {
      // ログインページの基本要素が表示されることを確認
      await expect(
        page.getByRole('heading', { name: 'みつまるケア' })
      ).toBeVisible();
      await expect(page.getByLabel('メールアドレス')).toBeVisible();
      await expect(page.getByLabel('パスワード')).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'ログイン' })
      ).toBeVisible();

      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // 管理者ダッシュボードに遷移することを確認
      await expect(page).toHaveURL(/.*admin.*/);
      await expect(
        page.getByRole('heading', { name: /管理者ダッシュボード|シフト管理/ })
      ).toBeVisible();
    });

    test('正常なログイン - 一般職員', async ({ page }) => {
      // 一般職員としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.employee.email);
      await page.getByLabel('パスワード').fill(testUsers.employee.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // 一般職員ダッシュボードに遷移することを確認
      await expect(page).toHaveURL(/.*user.*/);
      await expect(
        page.getByRole('heading', { name: /一般職員ダッシュボード|勤怠管理/ })
      ).toBeVisible();
    });

    test('ログイン失敗 - 無効な認証情報', async ({ page }) => {
      // 無効な認証情報でログイン試行
      await page.getByLabel('メールアドレス').fill('invalid@example.com');
      await page.getByLabel('パスワード').fill('wrongpassword');
      await page.getByRole('button', { name: 'ログイン' }).click();

      // エラーメッセージが表示されることを確認
      await expect(
        page.getByText(/認証に失敗しました|ログインできませんでした/)
      ).toBeVisible();

      // ログインページに留まることを確認
      await expect(page).toHaveURL('/');
    });

    test('ログイン失敗 - 空の入力', async ({ page }) => {
      // 空の入力でログイン試行
      await page.getByRole('button', { name: 'ログイン' }).click();

      // バリデーションエラーが表示されることを確認
      await expect(
        page.getByText(/メールアドレスを入力してください/)
      ).toBeVisible();
      await expect(
        page.getByText(/パスワードを入力してください/)
      ).toBeVisible();
    });

    test('ログアウト機能', async ({ page }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // ログアウトボタンをクリック
      await page
        .getByRole('button', { name: /ログアウト|サインアウト/ })
        .click();

      // ログインページに戻ることを確認
      await expect(page).toHaveURL('/');
      await expect(
        page.getByRole('heading', { name: 'みつまるケア' })
      ).toBeVisible();
    });
  });

  test.describe('シフト管理フロー (UC-ADM-001, UC-ADM-002)', () => {
    test.beforeEach(async ({ page }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();
    });

    test('月間シフト作成 - 基本フロー', async ({ page }) => {
      // シフト作成画面にアクセス
      await page.goto('/admin/shifts');
      await expect(
        page.getByRole('heading', { name: /シフト管理/ })
      ).toBeVisible();

      // シフト作成フォームが表示されることを確認
      await expect(page.getByText(/対象月/)).toBeVisible();
      await expect(page.getByText(/シフト形態/)).toBeVisible();
      await expect(page.getByText(/職員情報/)).toBeVisible();

      // 対象月を選択
      await page.getByLabel(/対象月/).selectOption('2025-03');

      // 基本要件を設定
      await page.getByLabel(/早番/).fill('2');
      await page.getByLabel(/日勤/).fill('3');
      await page.getByLabel(/遅番/).fill('2');

      // 自動シフト生成を実行
      await page
        .getByRole('button', { name: /自動シフト生成|シフト作成/ })
        .click();

      // 生成結果が表示されることを確認
      await expect(page.getByText(/シフトが生成されました/)).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });

    test('シフト編集・調整', async ({ page }) => {
      // シフト管理画面にアクセス
      await page.goto('/admin/shifts');

      // 既存のシフトを選択
      await page.getByText(/2025-03-15/).click();

      // シフト詳細画面が表示されることを確認
      await expect(
        page.getByRole('heading', { name: /シフト詳細/ })
      ).toBeVisible();

      // シフトセルを編集
      const firstCell = page.locator('table td').first();
      await firstCell.click();

      // シフト形態を変更
      await page.getByRole('combobox').selectOption('遅番');

      // 変更を保存
      await page.getByRole('button', { name: /保存/ }).click();

      // 保存完了メッセージが表示されることを確認
      await expect(page.getByText(/保存されました/)).toBeVisible();
    });

    test('シフト確定', async ({ page }) => {
      // シフト管理画面にアクセス
      await page.goto('/admin/shifts');

      // シフト確定ボタンをクリック
      await page.getByRole('button', { name: /シフト確定/ }).click();

      // 確定確認ダイアログが表示されることを確認
      await expect(page.getByText(/シフトを確定しますか/)).toBeVisible();

      // 確定を実行
      await page.getByRole('button', { name: /確定/ }).click();

      // 確定完了メッセージが表示されることを確認
      await expect(page.getByText(/シフトが確定されました/)).toBeVisible();
    });
  });

  test.describe('勤怠管理フロー (UC-EMP-001, UC-ADM-005)', () => {
    test('一般職員の出退勤打刻', async ({ page }) => {
      // 一般職員としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.employee.email);
      await page.getByLabel('パスワード').fill(testUsers.employee.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // 勤怠管理画面にアクセス
      await page.goto('/user/attendance');
      await expect(
        page.getByRole('heading', { name: /勤怠管理/ })
      ).toBeVisible();

      // 出勤打刻
      await page.getByRole('button', { name: /出勤/ }).click();

      // 打刻完了メッセージが表示されることを確認
      await expect(page.getByText(/出勤が記録されました/)).toBeVisible();

      // 退勤打刻
      await page.getByRole('button', { name: /退勤/ }).click();

      // 打刻完了メッセージが表示されることを確認
      await expect(page.getByText(/退勤が記録されました/)).toBeVisible();
    });

    test('勤怠修正申請', async ({ page }) => {
      // 一般職員としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.employee.email);
      await page.getByLabel('パスワード').fill(testUsers.employee.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // 勤怠管理画面にアクセス
      await page.goto('/user/attendance');

      // 修正申請ボタンをクリック
      await page.getByRole('button', { name: /修正申請/ }).click();

      // 修正申請フォームが表示されることを確認
      await expect(page.getByText(/修正申請/)).toBeVisible();

      // 修正内容を入力
      await page.getByLabel(/修正日時/).fill('2025-03-15 09:00');
      await page.getByLabel(/修正理由/).fill('電車の遅延により遅刻');

      // 申請を送信
      await page.getByRole('button', { name: /申請/ }).click();

      // 申請完了メッセージが表示されることを確認
      await expect(page.getByText(/修正申請が送信されました/)).toBeVisible();
    });

    test('管理者による勤怠確認・承認', async ({ page }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // 勤怠管理画面にアクセス
      await page.goto('/admin/attendance');
      await expect(
        page.getByRole('heading', { name: /勤怠管理/ })
      ).toBeVisible();

      // 勤怠一覧が表示されることを確認
      await expect(page.locator('table')).toBeVisible();

      // 修正申請がある場合の承認処理
      const pendingRequest = page
        .locator('tr')
        .filter({ hasText: '承認待ち' })
        .first();
      if (await pendingRequest.isVisible()) {
        await pendingRequest.getByRole('button', { name: /承認/ }).click();

        // 承認完了メッセージが表示されることを確認
        await expect(page.getByText(/承認されました/)).toBeVisible();
      }
    });
  });

  test.describe('役割表管理フロー (UC-ADM-004)', () => {
    test.beforeEach(async ({ page }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();
    });

    test('役割表作成', async ({ page }) => {
      // 役割表作成画面にアクセス
      await page.goto('/admin/role-assignments');
      await expect(
        page.getByRole('heading', { name: /役割表作成/ })
      ).toBeVisible();

      // 対象日を選択
      await page.getByLabel(/対象日/).fill('2025-03-15');

      // 役割テンプレートを選択
      await page.getByLabel(/役割テンプレート/).selectOption('基本配置');

      // 自動割り当てを実行
      await page.getByRole('button', { name: /自動割り当て/ }).click();

      // 割り当て結果が表示されることを確認
      await expect(page.getByText(/割り当てが完了しました/)).toBeVisible();

      // 役割表を確定
      await page.getByRole('button', { name: /確定/ }).click();

      // 確定完了メッセージが表示されることを確認
      await expect(page.getByText(/役割表が確定されました/)).toBeVisible();
    });
  });

  test.describe('シフト交換フロー (UC-EMP-004, UC-ADM-003)', () => {
    test('一般職員によるシフト交換申請', async ({ page }) => {
      // 一般職員としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.employee.email);
      await page.getByLabel('パスワード').fill(testUsers.employee.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // シフト交換画面にアクセス
      await page.goto('/user/shift-exchange');
      await expect(
        page.getByRole('heading', { name: /シフト交換/ })
      ).toBeVisible();

      // 交換したいシフトを選択
      await page.getByText(/2025-03-15/).click();

      // 交換相手を選択
      await page.getByLabel(/交換相手/).selectOption('田中 次郎');

      // 交換理由を入力
      await page.getByLabel(/交換理由/).fill('家族の用事のため');

      // 申請を送信
      await page.getByRole('button', { name: /申請/ }).click();

      // 申請完了メッセージが表示されることを確認
      await expect(
        page.getByText(/シフト交換申請が送信されました/)
      ).toBeVisible();
    });

    test('管理者によるシフト交換申請の承認', async ({ page }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // シフト交換管理画面にアクセス
      await page.goto('/admin/shift-exchange');
      await expect(
        page.getByRole('heading', { name: /シフト交換管理/ })
      ).toBeVisible();

      // 承認待ちの申請一覧が表示されることを確認
      await expect(page.getByText(/承認待ち/)).toBeVisible();

      // 申請を承認
      await page.getByRole('button', { name: /承認/ }).first().click();

      // 承認完了メッセージが表示されることを確認
      await expect(page.getByText(/承認されました/)).toBeVisible();
    });
  });

  test.describe('アクセス制限テスト', () => {
    test('一般職員の管理者機能へのアクセス制限', async ({ page }) => {
      // 一般職員としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.employee.email);
      await page.getByLabel('パスワード').fill(testUsers.employee.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // 管理者機能へのアクセスを試行
      await page.goto('/admin/shifts');

      // アクセス拒否または適切なエラーページが表示されることを確認
      await expect(
        page.getByText(/アクセス権限がありません|権限が不足しています/)
      ).toBeVisible();
    });

    test('未認証ユーザーの保護された機能へのアクセス制限', async ({ page }) => {
      // 認証なしで保護された機能にアクセス
      await page.goto('/admin/shifts');

      // ログインページにリダイレクトされることを確認
      await expect(page).toHaveURL('/');
      await expect(
        page.getByRole('heading', { name: 'みつまるケア' })
      ).toBeVisible();
    });
  });

  test.describe('エラーハンドリングテスト', () => {
    test('ネットワークエラー時の適切な処理', async ({ page }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // ネットワークエラーをシミュレート（オフライン状態）
      await page.context().setOffline(true);

      // シフト作成を試行
      await page.goto('/admin/shifts');
      await page.getByRole('button', { name: /シフト作成/ }).click();

      // エラーメッセージが適切に表示されることを確認
      await expect(
        page.getByText(/ネットワークエラー|接続できません/)
      ).toBeVisible();

      // オンライン状態に戻す
      await page.context().setOffline(false);
    });

    test('バリデーションエラーの適切な表示', async ({ page }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // シフト作成画面にアクセス
      await page.goto('/admin/shifts');

      // 無効なデータでシフト作成を試行
      await page.getByLabel(/対象月/).fill('invalid-date');
      await page.getByRole('button', { name: /シフト作成/ }).click();

      // バリデーションエラーが表示されることを確認
      await expect(
        page.getByText(/正しい日付形式で入力してください/)
      ).toBeVisible();
    });
  });

  test.describe('パフォーマンステスト', () => {
    test('大量データ表示時のパフォーマンス', async ({ page }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // シフト管理画面にアクセス
      await page.goto('/admin/shifts');

      // 大量データの表示開始時刻を記録
      const startTime = Date.now();

      // 過去1年分のシフトを表示
      await page.getByLabel(/対象期間/).selectOption('過去1年');

      // データ表示完了まで待機
      await page.waitForSelector('table tbody tr', { timeout: 30000 });

      // 表示完了時刻を記録
      const endTime = Date.now();
      const loadTime = endTime - startTime;

      // パフォーマンス要件を満たすことを確認（5秒以内）
      expect(loadTime).toBeLessThan(5000);
    });
  });
});
