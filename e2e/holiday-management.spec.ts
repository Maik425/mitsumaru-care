import { test, expect } from '@playwright/test';

// テストデータ
const testUsers = {
  admin: {
    email: 'admin@mitsumaru-care.com',
    password: 'admin123',
    name: '管理者 太郎',
    role: 'ADMIN',
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

const holidayTypes = {
  paid: '有給休暇',
  special: '特別休暇',
  sick: '病気休暇',
  personal: '私用休暇',
  maternity: '産前産後休暇',
  childcare: '育児休暇',
};

test.describe('休暇管理機能 - E2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    // ログインページから開始
    await page.goto('/');
  });

  test.describe('一般職員の休暇申請フロー (UC-EMP-003)', () => {
    test('有給休暇申請 - 基本フロー', async ({ page }) => {
      // 一般職員としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.employee.email);
      await page.getByLabel('パスワード').fill(testUsers.employee.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // 休暇管理画面にアクセス
      await page.goto('/user/holidays');
      await expect(
        page.getByRole('heading', { name: /休暇管理/ })
      ).toBeVisible();

      // 休暇申請ボタンをクリック
      await page.getByRole('button', { name: /休暇申請/ }).click();

      // 休暇申請フォームが表示されることを確認
      await expect(page.getByText(/休暇申請/)).toBeVisible();

      // 休暇種別を選択
      await page.getByLabel(/休暇種別/).selectOption(holidayTypes.paid);

      // 開始日・終了日を選択
      await page.getByLabel(/開始日/).fill('2025-04-15');
      await page.getByLabel(/終了日/).fill('2025-04-16');

      // 申請理由を入力
      await page.getByLabel(/申請理由/).fill('家族旅行のため');

      // 有給休暇残日数を確認
      await expect(page.getByText(/残日数: \d+日/)).toBeVisible();

      // 申請を送信
      await page.getByRole('button', { name: /申請/ }).click();

      // 申請完了メッセージが表示されることを確認
      await expect(page.getByText(/休暇申請が送信されました/)).toBeVisible();
    });

    test('特別休暇申請 - 複数日連続', async ({ page }) => {
      // 一般職員としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.employee.email);
      await page.getByLabel('パスワード').fill(testUsers.employee.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // 休暇管理画面にアクセス
      await page.goto('/user/holidays');

      // 休暇申請
      await page.getByRole('button', { name: /休暇申請/ }).click();

      // 特別休暇を選択
      await page.getByLabel(/休暇種別/).selectOption(holidayTypes.special);

      // 複数日連続で選択
      await page.getByLabel(/開始日/).fill('2025-04-20');
      await page.getByLabel(/終了日/).fill('2025-04-25');

      // 特別休暇の理由を選択
      await page.getByLabel(/特別休暇理由/).selectOption('結婚');

      // 申請理由を入力
      await page.getByLabel(/申請理由/).fill('結婚式の準備のため');

      // 申請を送信
      await page.getByRole('button', { name: /申請/ }).click();

      // 申請完了メッセージが表示されることを確認
      await expect(page.getByText(/休暇申請が送信されました/)).toBeVisible();
    });

    test('病気休暇申請 - 証明書添付', async ({ page }) => {
      // 看護師としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.nurse.email);
      await page.getByLabel('パスワード').fill(testUsers.nurse.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // 休暇管理画面にアクセス
      await page.goto('/user/holidays');

      // 休暇申請
      await page.getByRole('button', { name: /休暇申請/ }).click();

      // 病気休暇を選択
      await page.getByLabel(/休暇種別/).selectOption(holidayTypes.sick);

      // 日付を選択
      await page.getByLabel(/開始日/).fill('2025-04-10');
      await page.getByLabel(/終了日/).fill('2025-04-12');

      // 病気の種類を選択
      await page.getByLabel(/病気の種類/).selectOption('風邪');

      // 医師の診断書を添付
      const fileInput = page.getByLabel(/診断書/);
      await fileInput.setInputFiles('test-files/medical-certificate.pdf');

      // 申請理由を入力
      await page
        .getByLabel(/申請理由/)
        .fill('風邪のため医師から3日間の安静を指示');

      // 申請を送信
      await page.getByRole('button', { name: /申請/ }).click();

      // 申請完了メッセージが表示されることを確認
      await expect(page.getByText(/休暇申請が送信されました/)).toBeVisible();
    });

    test('有給休暇残日数不足時の処理', async ({ page }) => {
      // 一般職員としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.employee.email);
      await page.getByLabel('パスワード').fill(testUsers.employee.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // 休暇管理画面にアクセス
      await page.goto('/user/holidays');

      // 休暇申請
      await page.getByRole('button', { name: /休暇申請/ }).click();

      // 有給休暇を選択
      await page.getByLabel(/休暇種別/).selectOption(holidayTypes.paid);

      // 残日数を超える日数を選択
      await page.getByLabel(/開始日/).fill('2025-04-15');
      await page.getByLabel(/終了日/).fill('2025-05-15'); // 30日間

      // 申請理由を入力
      await page.getByLabel(/申請理由/).fill('長期旅行のため');

      // 申請を送信
      await page.getByRole('button', { name: /申請/ }).click();

      // 残日数不足のエラーメッセージが表示されることを確認
      await expect(
        page.getByText(/有給休暇の残日数が不足しています/)
      ).toBeVisible();

      // 申請可能な日数の提案が表示されることを確認
      await expect(page.getByText(/申請可能日数: \d+日/)).toBeVisible();
    });

    test('休暇申請の編集・取消', async ({ page }) => {
      // 一般職員としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.employee.email);
      await page.getByLabel('パスワード').fill(testUsers.employee.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // 休暇管理画面にアクセス
      await page.goto('/user/holidays');

      // 申請済みの休暇を選択
      await page.getByText(/2025-04-15/).click();

      // 編集ボタンをクリック
      await page.getByRole('button', { name: /編集/ }).click();

      // 編集フォームが表示されることを確認
      await expect(page.getByText(/休暇申請編集/)).toBeVisible();

      // 終了日を変更
      await page.getByLabel(/終了日/).fill('2025-04-17');

      // 変更を保存
      await page.getByRole('button', { name: /保存/ }).click();

      // 保存完了メッセージが表示されることを確認
      await expect(page.getByText(/変更が保存されました/)).toBeVisible();

      // 取消ボタンをクリック
      await page.getByRole('button', { name: /取消/ }).click();

      // 取消確認ダイアログが表示されることを確認
      await expect(page.getByText(/この申請を取り消しますか/)).toBeVisible();

      // 取消を実行
      await page.getByRole('button', { name: /取消/ }).click();

      // 取消完了メッセージが表示されることを確認
      await expect(page.getByText(/申請が取り消されました/)).toBeVisible();
    });
  });

  test.describe('管理者の休暇承認フロー (UC-ADM-008)', () => {
    test.beforeEach(async ({ page }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();
    });

    test('休暇申請一覧の確認', async ({ page }) => {
      // 休暇管理画面にアクセス
      await page.goto('/admin/holidays');
      await expect(
        page.getByRole('heading', { name: /休暇管理/ })
      ).toBeVisible();

      // 休暇申請一覧が表示されることを確認
      await expect(page.locator('table')).toBeVisible();

      // 申請状態によるフィルタリングが可能であることを確認
      await expect(page.getByText(/承認待ち/)).toBeVisible();
      await expect(page.getByText(/承認済み/)).toBeVisible();
      await expect(page.getByText(/却下/)).toBeVisible();
    });

    test('休暇申請の承認処理', async ({ page }) => {
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

      // 申請内容を確認
      await expect(page.getByText(/申請者/)).toBeVisible();
      await expect(page.getByText(/休暇種別/)).toBeVisible();
      await expect(page.getByText(/申請期間/)).toBeVisible();
      await expect(page.getByText(/申請理由/)).toBeVisible();

      // 承認ボタンをクリック
      await page.getByRole('button', { name: /承認/ }).click();

      // 承認確認ダイアログが表示されることを確認
      await expect(page.getByText(/この申請を承認しますか/)).toBeVisible();

      // 承認を実行
      await page.getByRole('button', { name: /承認/ }).click();

      // 承認完了メッセージが表示されることを確認
      await expect(page.getByText(/申請が承認されました/)).toBeVisible();
    });

    test('休暇申請の却下処理', async ({ page }) => {
      // 休暇管理画面にアクセス
      await page.goto('/admin/holidays');

      // 承認待ちの申請を選択
      const pendingRequest = page
        .locator('tr')
        .filter({ hasText: '承認待ち' })
        .first();
      await pendingRequest.click();

      // 却下ボタンをクリック
      await page.getByRole('button', { name: /却下/ }).click();

      // 却下理由入力フォームが表示されることを確認
      await expect(page.getByText(/却下理由/)).toBeVisible();

      // 却下理由を入力
      await page.getByLabel(/却下理由/).fill('業務上必要な時期のため');

      // 却下を実行
      await page.getByRole('button', { name: /却下/ }).click();

      // 却下完了メッセージが表示されることを確認
      await expect(page.getByText(/申請が却下されました/)).toBeVisible();
    });

    test('休暇申請の条件付き承認', async ({ page }) => {
      // 休暇管理画面にアクセス
      await page.goto('/admin/holidays');

      // 承認待ちの申請を選択
      const pendingRequest = page
        .locator('tr')
        .filter({ hasText: '承認待ち' })
        .first();
      await pendingRequest.click();

      // 条件付き承認ボタンをクリック
      await page.getByRole('button', { name: /条件付き承認/ }).click();

      // 条件入力フォームが表示されることを確認
      await expect(page.getByText(/承認条件/)).toBeVisible();

      // 条件を入力
      await page.getByLabel(/承認条件/).fill('代替要員の確保ができた場合のみ');

      // 条件付き承認を実行
      await page.getByRole('button', { name: /条件付き承認/ }).click();

      // 条件付き承認完了メッセージが表示されることを確認
      await expect(page.getByText(/条件付き承認が完了しました/)).toBeVisible();
    });
  });

  test.describe('休暇カレンダー・スケジュール管理', () => {
    test.beforeEach(async ({ page }) => {
      // 一般職員としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.employee.email);
      await page.getByLabel('パスワード').fill(testUsers.employee.password);
      await page.getByRole('button', { name: 'ログイン' }).click();
    });

    test('休暇カレンダーの表示', async ({ page }) => {
      // 休暇管理画面にアクセス
      await page.goto('/user/holidays');

      // カレンダー表示に切り替え
      await page.getByRole('button', { name: /カレンダー/ }).click();

      // カレンダーが表示されることを確認
      await expect(page.locator('.calendar')).toBeVisible();

      // 申請済みの休暇がカレンダーに表示されることを確認
      await expect(page.getByText(/有給休暇/)).toBeVisible();
      await expect(page.getByText(/特別休暇/)).toBeVisible();
    });

    test('休暇スケジュールの確認', async ({ page }) => {
      // 休暇管理画面にアクセス
      await page.goto('/user/holidays');

      // スケジュール表示に切り替え
      await page.getByRole('button', { name: /スケジュール/ }).click();

      // スケジュールが表示されることを確認
      await expect(page.locator('.schedule')).toBeVisible();

      // 月別・週別の表示切り替えが可能であることを確認
      await page.getByRole('button', { name: /月表示/ }).click();
      await expect(page.locator('.month-view')).toBeVisible();

      await page.getByRole('button', { name: /週表示/ }).click();
      await expect(page.locator('.week-view')).toBeVisible();
    });

    test('休暇申請の重複チェック', async ({ page }) => {
      // 休暇管理画面にアクセス
      await page.goto('/user/holidays');

      // 休暇申請
      await page.getByRole('button', { name: /休暇申請/ }).click();

      // 既存の休暇と重複する日付を選択
      await page.getByLabel(/開始日/).fill('2025-04-15');
      await page.getByLabel(/終了日/).fill('2025-04-16');

      // 休暇種別を選択
      await page.getByLabel(/休暇種別/).selectOption(holidayTypes.paid);

      // 申請理由を入力
      await page.getByLabel(/申請理由/).fill('重複テスト');

      // 申請を送信
      await page.getByRole('button', { name: /申請/ }).click();

      // 重複エラーメッセージが表示されることを確認
      await expect(page.getByText(/既に休暇が申請されています/)).toBeVisible();

      // 重複している休暇の詳細が表示されることを確認
      await expect(page.getByText(/重複する休暇/)).toBeVisible();
    });
  });

  test.describe('休暇統計・レポート機能', () => {
    test.beforeEach(async ({ page }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();
    });

    test('休暇使用状況の統計表示', async ({ page }) => {
      // 休暇管理画面にアクセス
      await page.goto('/admin/holidays');

      // 統計タブをクリック
      await page.getByRole('tab', { name: /統計/ }).click();

      // 統計情報が表示されることを確認
      await expect(page.getByText(/休暇使用状況/)).toBeVisible();
      await expect(page.getByText(/有給休暇/)).toBeVisible();
      await expect(page.getByText(/特別休暇/)).toBeVisible();

      // グラフ・チャートが表示されることを確認
      await expect(page.locator('canvas')).toBeVisible();
    });

    test('休暇レポートの生成・エクスポート', async ({ page }) => {
      // 休暇管理画面にアクセス
      await page.goto('/admin/holidays');

      // レポートタブをクリック
      await page.getByRole('tab', { name: /レポート/ }).click();

      // レポート生成フォームが表示されることを確認
      await expect(page.getByText(/レポート生成/)).toBeVisible();

      // 対象期間を選択
      await page.getByLabel(/開始期間/).fill('2025-01-01');
      await page.getByLabel(/終了期間/).fill('2025-12-31');

      // レポート種別を選択
      await page.getByLabel(/レポート種別/).selectOption('月別休暇使用状況');

      // レポートを生成
      await page.getByRole('button', { name: /生成/ }).click();

      // レポートが生成されることを確認
      await expect(page.getByText(/レポートが生成されました/)).toBeVisible();

      // エクスポートボタンが表示されることを確認
      await expect(
        page.getByRole('button', { name: /エクスポート/ })
      ).toBeVisible();

      // PDFでエクスポート
      await page.getByRole('button', { name: /PDF/ }).click();

      // エクスポート完了メッセージが表示されることを確認
      await expect(page.getByText(/エクスポートが完了しました/)).toBeVisible();
    });
  });

  test.describe('休暇申請の通知・コミュニケーション', () => {
    test('申請時の通知送信', async ({ page }) => {
      // 一般職員としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.employee.email);
      await page.getByLabel('パスワード').fill(testUsers.employee.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // 休暇管理画面にアクセス
      await page.goto('/user/holidays');

      // 休暇申請
      await page.getByRole('button', { name: /休暇申請/ }).click();

      // 通知設定を確認
      await expect(page.getByText(/通知設定/)).toBeVisible();

      // メール通知を有効にする
      await page.getByLabel(/メール通知/).check();

      // 申請を送信
      await page.getByLabel(/休暇種別/).selectOption(holidayTypes.paid);
      await page.getByLabel(/開始日/).fill('2025-04-15');
      await page.getByLabel(/終了日/).fill('2025-04-16');
      await page.getByLabel(/申請理由/).fill('通知テスト');
      await page.getByRole('button', { name: /申請/ }).click();

      // 通知送信完了メッセージが表示されることを確認
      await expect(page.getByText(/通知が送信されました/)).toBeVisible();
    });

    test('承認・却下結果の通知確認', async ({ page }) => {
      // 一般職員としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.employee.email);
      await page.getByLabel('パスワード').fill(testUsers.employee.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // 通知画面にアクセス
      await page.goto('/user/notifications');

      // 通知一覧が表示されることを確認
      await expect(page.getByRole('heading', { name: /通知/ })).toBeVisible();

      // 休暇申請関連の通知が表示されることを確認
      await expect(page.getByText(/休暇申請/)).toBeVisible();
    });
  });
});
