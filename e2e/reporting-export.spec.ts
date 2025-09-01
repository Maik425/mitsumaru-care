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
};

test.describe('レポート・エクスポート・通知機能 - E2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    // ログインページから開始
    await page.goto('/');
  });

  test.describe('勤怠レポート機能', () => {
    test.beforeEach(async ({ page }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();
    });

    test('日次勤怠レポートの生成', async ({ page }) => {
      // 勤怠レポート画面にアクセス
      await page.goto('/admin/reports/attendance');
      await expect(
        page.getByRole('heading', { name: /勤怠レポート/ })
      ).toBeVisible();

      // 日次レポートタブをクリック
      await page.getByRole('tab', { name: /日次/ }).click();

      // レポート生成フォームが表示されることを確認
      await expect(page.getByText(/レポート生成/)).toBeVisible();

      // 対象日を選択
      await page.getByLabel(/対象日/).fill('2025-03-15');

      // レポート種別を選択
      await page.getByLabel(/レポート種別/).selectOption('全職員勤怠状況');

      // レポートを生成
      await page.getByRole('button', { name: /生成/ }).click();

      // レポートが生成されることを確認
      await expect(page.getByText(/レポートが生成されました/)).toBeVisible();

      // レポート内容が表示されることを確認
      await expect(page.getByText(/出勤者数/)).toBeVisible();
      await expect(page.getByText(/欠勤者数/)).toBeVisible();
      await expect(page.getByText(/遅刻者数/)).toBeVisible();
      await expect(page.getByText(/早退者数/)).toBeVisible();
    });

    test('月次勤怠レポートの生成', async ({ page }) => {
      // 勤怠レポート画面にアクセス
      await page.goto('/admin/reports/attendance');

      // 月次レポートタブをクリック
      await page.getByRole('tab', { name: /月次/ }).click();

      // 対象月を選択
      await page.getByLabel(/対象月/).fill('2025-03');

      // レポート種別を選択
      await page.getByLabel(/レポート種別/).selectOption('月間勤怠集計');

      // レポートを生成
      await page.getByRole('button', { name: /生成/ }).click();

      // レポートが生成されることを確認
      await expect(page.getByText(/レポートが生成されました/)).toBeVisible();

      // 月次統計が表示されることを確認
      await expect(page.getByText(/総勤務日数/)).toBeVisible();
      await expect(page.getByText(/平均勤務時間/)).toBeVisible();
      await expect(page.getByText(/残業時間合計/)).toBeVisible();
    });

    test('個人別勤怠レポートの生成', async ({ page }) => {
      // 勤怠レポート画面にアクセス
      await page.goto('/admin/reports/attendance');

      // 個人別レポートタブをクリック
      await page.getByRole('tab', { name: /個人別/ }).click();

      // 対象職員を選択
      await page.getByLabel(/対象職員/).selectOption('田中 次郎');

      // 対象期間を選択
      await page.getByLabel(/開始日/).fill('2025-03-01');
      await page.getByLabel(/終了日/).fill('2025-03-31');

      // レポートを生成
      await page.getByRole('button', { name: /生成/ }).click();

      // レポートが生成されることを確認
      await expect(page.getByText(/レポートが生成されました/)).toBeVisible();

      // 個人別統計が表示されることを確認
      await expect(page.getByText(/勤務日数/)).toBeVisible();
      await expect(page.getByText(/総勤務時間/)).toBeVisible();
      await expect(page.getByText(/残業時間/)).toBeVisible();
      await expect(page.getByText(/有給休暇使用日数/)).toBeVisible();
    });
  });

  test.describe('シフトレポート機能', () => {
    test.beforeEach(async ({ page }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();
    });

    test('月間シフト表の生成', async ({ page }) => {
      // シフトレポート画面にアクセス
      await page.goto('/admin/reports/shifts');
      await expect(
        page.getByRole('heading', { name: /シフトレポート/ })
      ).toBeVisible();

      // 月間シフト表タブをクリック
      await page.getByRole('tab', { name: /月間シフト表/ }).click();

      // 対象月を選択
      await page.getByLabel(/対象月/).fill('2025-03');

      // 表示形式を選択
      await page.getByLabel(/表示形式/).selectOption('カレンダー形式');

      // レポートを生成
      await page.getByRole('button', { name: /生成/ }).click();

      // レポートが生成されることを確認
      await expect(page.getByText(/レポートが生成されました/)).toBeVisible();

      // 月間シフト表が表示されることを確認
      await expect(page.locator('.calendar')).toBeVisible();
      await expect(page.getByText(/早番/)).toBeVisible();
      await expect(page.getByText(/日勤/)).toBeVisible();
      await expect(page.getByText(/遅番/)).toBeVisible();
    });

    test('シフト配置分析レポートの生成', async ({ page }) => {
      // シフトレポート画面にアクセス
      await page.goto('/admin/reports/shifts');

      // シフト配置分析タブをクリック
      await page.getByRole('tab', { name: /配置分析/ }).click();

      // 対象期間を選択
      await page.getByLabel(/開始日/).fill('2025-03-01');
      await page.getByLabel(/終了日/).fill('2025-03-31');

      // 分析項目を選択
      await page.getByLabel(/職員別勤務回数/).check();
      await page.getByLabel(/時間帯別配置状況/).check();
      await page.getByLabel(/技能別配置状況/).check();

      // レポートを生成
      await page.getByRole('button', { name: /生成/ }).click();

      // レポートが生成されることを確認
      await expect(page.getByText(/レポートが生成されました/)).toBeVisible();

      // 分析結果が表示されることを確認
      await expect(page.getByText(/職員別勤務回数/)).toBeVisible();
      await expect(page.getByText(/時間帯別配置状況/)).toBeVisible();
      await expect(page.getByText(/技能別配置状況/)).toBeVisible();
    });
  });

  test.describe('休暇レポート機能', () => {
    test.beforeEach(async ({ page }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();
    });

    test('休暇使用状況レポートの生成', async ({ page }) => {
      // 休暇レポート画面にアクセス
      await page.goto('/admin/reports/holidays');
      await expect(
        page.getByRole('heading', { name: /休暇レポート/ })
      ).toBeVisible();

      // 対象期間を選択
      await page.getByLabel(/開始期間/).fill('2025-01-01');
      await page.getByLabel(/終了期間/).fill('2025-12-31');

      // レポート種別を選択
      await page.getByLabel(/レポート種別/).selectOption('休暇使用状況');

      // レポートを生成
      await page.getByRole('button', { name: /生成/ }).click();

      // レポートが生成されることを確認
      await expect(page.getByText(/レポートが生成されました/)).toBeVisible();

      // 休暇使用状況が表示されることを確認
      await expect(page.getByText(/有給休暇/)).toBeVisible();
      await expect(page.getByText(/特別休暇/)).toBeVisible();
      await expect(page.getByText(/病気休暇/)).toBeVisible();
    });

    test('休暇残日数レポートの生成', async ({ page }) => {
      // 休暇レポート画面にアクセス
      await page.goto('/admin/reports/holidays');

      // 休暇残日数タブをクリック
      await page.getByRole('tab', { name: /残日数/ }).click();

      // 対象日を選択
      await page.getByLabel(/対象日/).fill('2025-03-31');

      // レポートを生成
      await page.getByRole('button', { name: /生成/ }).click();

      // レポートが生成されることを確認
      await expect(page.getByText(/レポートが生成されました/)).toBeVisible();

      // 残日数情報が表示されることを確認
      await expect(page.getByText(/職員名/)).toBeVisible();
      await expect(page.getByText(/有給休暇残日数/)).toBeVisible();
      await expect(page.getByText(/特別休暇残日数/)).toBeVisible();
    });
  });

  test.describe('データエクスポート機能', () => {
    test.beforeEach(async ({ page }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();
    });

    test('勤怠データのExcelエクスポート', async ({ page }) => {
      // 勤怠レポート画面にアクセス
      await page.goto('/admin/reports/attendance');

      // 対象期間を選択
      await page.getByLabel(/開始日/).fill('2025-03-01');
      await page.getByLabel(/終了日/).fill('2025-03-31');

      // レポートを生成
      await page.getByRole('button', { name: /生成/ }).click();

      // Excelエクスポートボタンをクリック
      await page.getByRole('button', { name: /Excel/ }).click();

      // エクスポート設定を確認
      await expect(page.getByText(/エクスポート設定/)).toBeVisible();

      // エクスポート項目を選択
      await page.getByLabel(/基本情報/).check();
      await page.getByLabel(/勤怠情報/).check();
      await page.getByLabel(/統計情報/).check();

      // エクスポートを実行
      await page.getByRole('button', { name: /エクスポート/ }).click();

      // エクスポート完了メッセージが表示されることを確認
      await expect(page.getByText(/エクスポートが完了しました/)).toBeVisible();
    });

    test('シフト表のPDFエクスポート', async ({ page }) => {
      // シフトレポート画面にアクセス
      await page.goto('/admin/reports/shifts');

      // 月間シフト表を生成
      await page.getByRole('tab', { name: /月間シフト表/ }).click();
      await page.getByLabel(/対象月/).fill('2025-03');
      await page.getByRole('button', { name: /生成/ }).click();

      // PDFエクスポートボタンをクリック
      await page.getByRole('button', { name: /PDF/ }).click();

      // PDF設定を確認
      await expect(page.getByText(/PDF設定/)).toBeVisible();

      // ページ設定を調整
      await page.getByLabel(/用紙サイズ/).selectOption('A4');
      await page.getByLabel(/向き/).selectOption('横向き');

      // エクスポートを実行
      await page.getByRole('button', { name: /エクスポート/ }).click();

      // エクスポート完了メッセージが表示されることを確認
      await expect(page.getByText(/エクスポートが完了しました/)).toBeVisible();
    });

    test('CSV形式でのデータエクスポート', async ({ page }) => {
      // データエクスポート画面にアクセス
      await page.goto('/admin/export');
      await expect(
        page.getByRole('heading', { name: /データエクスポート/ })
      ).toBeVisible();

      // エクスポート対象を選択
      await page.getByLabel(/勤怠データ/).check();
      await page.getByLabel(/シフトデータ/).check();
      await page.getByLabel(/職員データ/).check();

      // エクスポート形式を選択
      await page.getByLabel(/エクスポート形式/).selectOption('CSV');

      // 対象期間を選択
      await page.getByLabel(/開始日/).fill('2025-03-01');
      await page.getByLabel(/終了日/).fill('2025-03-31');

      // エクスポートを実行
      await page.getByRole('button', { name: /エクスポート/ }).click();

      // エクスポート完了メッセージが表示されることを確認
      await expect(page.getByText(/エクスポートが完了しました/)).toBeVisible();
    });
  });

  test.describe('通知・コミュニケーション機能', () => {
    test.beforeEach(async ({ page }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();
    });

    test('シフト確定時の通知送信', async ({ page }) => {
      // シフト管理画面にアクセス
      await page.goto('/admin/shifts');

      // シフト確定ボタンをクリック
      await page.getByRole('button', { name: /シフト確定/ }).click();

      // 確定確認ダイアログが表示されることを確認
      await expect(page.getByText(/シフトを確定しますか/)).toBeVisible();

      // 通知設定を確認
      await page.getByLabel(/職員に通知/).check();
      await page.getByLabel(/メール通知/).check();

      // 通知メッセージを編集
      await page
        .getByLabel(/通知メッセージ/)
        .fill('3月のシフトが確定されました。確認をお願いします。');

      // 確定を実行
      await page.getByRole('button', { name: /確定/ }).click();

      // 確定完了メッセージが表示されることを確認
      await expect(page.getByText(/シフトが確定されました/)).toBeVisible();

      // 通知送信完了メッセージが表示されることを確認
      await expect(page.getByText(/通知が送信されました/)).toBeVisible();
    });

    test('休暇申請時の通知送信', async ({ page }) => {
      // 休暇管理画面にアクセス
      await page.goto('/admin/holidays');

      // 承認待ちの申請を選択
      const pendingRequest = page
        .locator('tr')
        .filter({ hasText: '承認待ち' })
        .first();
      await pendingRequest.click();

      // 申請詳細が表示されることを確認
      await expect(page.getByText(/申請詳細/)).toBeVisible();

      // 承認ボタンをクリック
      await page.getByRole('button', { name: /承認/ }).click();

      // 通知設定を確認
      await page.getByLabel(/申請者に通知/).check();
      await page.getByLabel(/メール通知/).check();

      // 承認メッセージを入力
      await page.getByLabel(/承認メッセージ/).fill('休暇申請を承認しました。');

      // 承認を実行
      await page.getByRole('button', { name: /承認/ }).click();

      // 承認完了メッセージが表示されることを確認
      await expect(page.getByText(/申請が承認されました/)).toBeVisible();

      // 通知送信完了メッセージが表示されることを確認
      await expect(page.getByText(/通知が送信されました/)).toBeVisible();
    });

    test('システムメッセージの管理', async ({ page }) => {
      // システムメッセージ管理画面にアクセス
      await page.goto('/admin/settings/messages');
      await expect(
        page.getByRole('heading', { name: /システムメッセージ管理/ })
      ).toBeVisible();

      // 新規作成ボタンをクリック
      await page.getByRole('button', { name: /新規作成/ }).click();

      // メッセージ作成フォームが表示されることを確認
      await expect(page.getByText(/メッセージ作成/)).toBeVisible();

      // 基本情報を入力
      await page
        .getByLabel(/メッセージタイトル/)
        .fill('システムメンテナンスのお知らせ');
      await page
        .getByLabel(/メッセージ内容/)
        .fill('3月20日22:00-24:00にシステムメンテナンスを実施します。');
      await page.getByLabel(/表示期間/).fill('2025-03-15');

      // 表示対象を選択
      await page.getByLabel(/全職員/).check();

      // 重要度を設定
      await page.getByLabel(/重要度/).selectOption('高');

      // 作成を実行
      await page.getByRole('button', { name: /作成/ }).click();

      // 作成完了メッセージが表示されることを確認
      await expect(page.getByText(/メッセージが作成されました/)).toBeVisible();
    });
  });

  test.describe('通知設定・管理機能', () => {
    test.beforeEach(async ({ page }) => {
      // 施設長としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.owner.email);
      await page.getByLabel('パスワード').fill(testUsers.owner.password);
      await page.getByRole('button', { name: 'ログイン' }).click();
    });

    test('通知テンプレートの管理', async ({ page }) => {
      // 通知設定画面にアクセス
      await page.goto('/admin/settings/notifications');
      await expect(
        page.getByRole('heading', { name: /通知設定/ })
      ).toBeVisible();

      // テンプレート管理タブをクリック
      await page.getByRole('tab', { name: /テンプレート管理/ }).click();

      // 新規作成ボタンをクリック
      await page.getByRole('button', { name: /新規作成/ }).click();

      // テンプレート作成フォームが表示されることを確認
      await expect(page.getByText(/テンプレート作成/)).toBeVisible();

      // 基本情報を入力
      await page.getByLabel(/テンプレート名/).fill('シフト確定通知');
      await page.getByLabel(/通知種別/).selectOption('シフト確定');

      // テンプレート内容を入力
      await page.getByLabel(/件名/).fill('シフト確定のお知らせ');
      await page
        .getByLabel(/本文/)
        .fill('{{month}}月のシフトが確定されました。確認をお願いします。');

      // 作成を実行
      await page.getByRole('button', { name: /作成/ }).click();

      // 作成完了メッセージが表示されることを確認
      await expect(
        page.getByText(/テンプレートが作成されました/)
      ).toBeVisible();
    });

    test('通知配信設定の管理', async ({ page }) => {
      // 通知設定画面にアクセス
      await page.goto('/admin/settings/notifications');

      // 配信設定タブをクリック
      await page.getByRole('tab', { name: /配信設定/ }).click();

      // 通知種別別の設定を変更
      await page.getByLabel(/シフト確定通知/).check();
      await page.getByLabel(/休暇申請通知/).check();
      await page.getByLabel(/勤怠異常通知/).check();

      // 配信方法を設定
      await page.getByLabel(/メール配信/).check();
      await page.getByLabel(/システム内通知/).check();
      await page.getByLabel(/SMS配信/).uncheck();

      // 配信タイミングを設定
      await page.getByLabel(/即時配信/).check();
      await page.getByLabel(/日次まとめ配信/).check();

      // 変更を保存
      await page.getByRole('button', { name: /保存/ }).click();

      // 保存完了メッセージが表示されることを確認
      await expect(page.getByText(/配信設定が保存されました/)).toBeVisible();
    });
  });

  test.describe('一般職員の通知確認機能', () => {
    test.beforeEach(async ({ page }) => {
      // 一般職員としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.employee.email);
      await page.getByLabel('パスワード').fill(testUsers.employee.password);
      await page.getByRole('button', { name: 'ログイン' }).click();
    });

    test('通知一覧の表示・確認', async ({ page }) => {
      // 通知画面にアクセス
      await page.goto('/user/notifications');
      await expect(page.getByRole('heading', { name: /通知/ })).toBeVisible();

      // 通知一覧が表示されることを確認
      await expect(page.locator('.notification-list')).toBeVisible();

      // 通知の分類が表示されることを確認
      await expect(page.getByText(/未読/)).toBeVisible();
      await expect(page.getByText(/既読/)).toBeVisible();

      // 未読通知をクリック
      const unreadNotification = page
        .locator('.notification-item.unread')
        .first();
      await unreadNotification.click();

      // 通知詳細が表示されることを確認
      await expect(page.getByText(/通知詳細/)).toBeVisible();

      // 既読ボタンをクリック
      await page.getByRole('button', { name: /既読/ }).click();

      // 既読完了メッセージが表示されることを確認
      await expect(page.getByText(/既読にしました/)).toBeVisible();
    });

    test('通知設定の変更', async ({ page }) => {
      // 通知設定画面にアクセス
      await page.goto('/user/settings/notifications');
      await expect(
        page.getByRole('heading', { name: /通知設定/ })
      ).toBeVisible();

      // 通知種別別の設定を変更
      await page.getByLabel(/シフト関連通知/).check();
      await page.getByLabel(/休暇関連通知/).check();
      await page.getByLabel(/勤怠関連通知/).check();

      // 配信方法を設定
      await page.getByLabel(/メール通知/).check();
      await page.getByLabel(/システム内通知/).check();

      // 配信タイミングを設定
      await page.getByLabel(/即時通知/).check();
      await page.getByLabel(/日次まとめ通知/).uncheck();

      // 変更を保存
      await page.getByRole('button', { name: /保存/ }).click();

      // 保存完了メッセージが表示されることを確認
      await expect(page.getByText(/通知設定が保存されました/)).toBeVisible();
    });
  });
});
