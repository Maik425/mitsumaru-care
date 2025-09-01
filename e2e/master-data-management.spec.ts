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
};

test.describe('マスターデータ管理機能 - E2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    // ログインページから開始
    await page.goto('/');
  });

  test.describe('職員管理機能 (UC-ADM-006)', () => {
    test.beforeEach(async ({ page }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();
    });

    test('職員一覧の表示・検索', async ({ page }) => {
      // 職員管理画面にアクセス
      await page.goto('/admin/staff');
      await expect(
        page.getByRole('heading', { name: /職員管理/ })
      ).toBeVisible();

      // 職員一覧が表示されることを確認
      await expect(page.locator('table')).toBeVisible();

      // 検索機能が利用可能であることを確認
      await expect(page.getByLabel(/検索/)).toBeVisible();

      // 職員名で検索
      await page.getByLabel(/検索/).fill('田中');
      await page.getByRole('button', { name: /検索/ }).click();

      // 検索結果が表示されることを確認
      await expect(page.getByText(/田中/)).toBeVisible();
    });

    test('新規職員登録', async ({ page }) => {
      // 職員管理画面にアクセス
      await page.goto('/admin/staff');

      // 新規登録ボタンをクリック
      await page.getByRole('button', { name: /新規登録/ }).click();

      // 職員登録フォームが表示されることを確認
      await expect(page.getByText(/職員登録/)).toBeVisible();

      // 基本情報を入力
      await page.getByLabel(/従業員番号/).fill('EMP001');
      await page.getByLabel(/氏名/).fill('佐藤 美咲');
      await page.getByLabel(/フリガナ/).fill('サトウ ミサキ');
      await page
        .getByLabel(/メールアドレス/)
        .fill('sato.misaki@mitsumaru-care.com');
      await page.getByLabel(/電話番号/).fill('090-1234-5678');

      // 個人情報を入力
      await page.getByLabel(/生年月日/).fill('1990-05-15');
      await page.getByLabel(/性別/).selectOption('女性');
      await page.getByLabel(/住所/).fill('東京都渋谷区1-2-3');

      // 勤務情報を入力
      await page.getByLabel(/入社日/).fill('2020-04-01');
      await page.getByLabel(/雇用形態/).selectOption('正社員');
      await page.getByLabel(/所属部署/).selectOption('介護課');

      // 役職・資格を選択
      await page.getByLabel(/役職/).selectOption('介護福祉士');
      await page.getByLabel(/資格/).selectOption('介護福祉士');

      // 登録を実行
      await page.getByRole('button', { name: /登録/ }).click();

      // 登録完了メッセージが表示されることを確認
      await expect(page.getByText(/職員が登録されました/)).toBeVisible();
    });

    test('既存職員の編集', async ({ page }) => {
      // 職員管理画面にアクセス
      await page.goto('/admin/staff');

      // 編集対象の職員を選択
      await page.getByText(/田中 次郎/).click();

      // 職員詳細画面が表示されることを確認
      await expect(page.getByText(/職員詳細/)).toBeVisible();

      // 編集ボタンをクリック
      await page.getByRole('button', { name: /編集/ }).click();

      // 編集フォームが表示されることを確認
      await expect(page.getByText(/職員編集/)).toBeVisible();

      // 電話番号を変更
      await page.getByLabel(/電話番号/).fill('090-9876-5432');

      // 所属部署を変更
      await page.getByLabel(/所属部署/).selectOption('看護課');

      // 変更を保存
      await page.getByRole('button', { name: /保存/ }).click();

      // 保存完了メッセージが表示されることを確認
      await expect(page.getByText(/変更が保存されました/)).toBeVisible();
    });

    test('職員の削除・退職処理', async ({ page }) => {
      // 職員管理画面にアクセス
      await page.goto('/admin/staff');

      // 削除対象の職員を選択
      await page.getByText(/山田 花子/).click();

      // 削除ボタンをクリック
      await page.getByRole('button', { name: /削除/ }).click();

      // 削除確認ダイアログが表示されることを確認
      await expect(page.getByText(/この職員を削除しますか/)).toBeVisible();

      // 削除理由を選択
      await page.getByLabel(/削除理由/).selectOption('退職');

      // 退職日を入力
      await page.getByLabel(/退職日/).fill('2025-03-31');

      // 削除を実行
      await page.getByRole('button', { name: /削除/ }).click();

      // 削除完了メッセージが表示されることを確認
      await expect(page.getByText(/職員が削除されました/)).toBeVisible();
    });

    test('職員の一括操作', async ({ page }) => {
      // 職員管理画面にアクセス
      await page.goto('/admin/staff');

      // 一括操作チェックボックスを有効にする
      await page.getByLabel(/一括操作/).check();

      // 複数の職員を選択
      await page.getByLabel(/田中 次郎/).check();
      await page.getByLabel(/佐藤 美咲/).check();

      // 一括操作メニューが表示されることを確認
      await expect(page.getByText(/一括操作/)).toBeVisible();

      // 所属部署の一括変更
      await page.getByRole('button', { name: /所属部署変更/ }).click();
      await page.getByLabel(/新しい所属部署/).selectOption('総務課');
      await page.getByRole('button', { name: /変更/ }).click();

      // 一括変更完了メッセージが表示されることを確認
      await expect(page.getByText(/一括変更が完了しました/)).toBeVisible();
    });
  });

  test.describe('シフト形態管理機能', () => {
    test.beforeEach(async ({ page }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();
    });

    test('シフト形態の登録・編集', async ({ page }) => {
      // シフト形態管理画面にアクセス
      await page.goto('/admin/master/shift-types');
      await expect(
        page.getByRole('heading', { name: /シフト形態管理/ })
      ).toBeVisible();

      // 新規登録ボタンをクリック
      await page.getByRole('button', { name: /新規登録/ }).click();

      // シフト形態登録フォームが表示されることを確認
      await expect(page.getByText(/シフト形態登録/)).toBeVisible();

      // 基本情報を入力
      await page.getByLabel(/シフト形態名/).fill('夜勤専従');
      await page.getByLabel(/開始時刻/).fill('22:00');
      await page.getByLabel(/終了時刻/).fill('08:00');
      await page.getByLabel(/休憩時間/).fill('60');

      // 勤務条件を設定
      await page.getByLabel(/必要人数/).fill('3');
      await page.getByLabel(/必要資格/).selectOption('看護師');
      await page.getByLabel(/手当/).fill('5000');

      // 登録を実行
      await page.getByRole('button', { name: /登録/ }).click();

      // 登録完了メッセージが表示されることを確認
      await expect(page.getByText(/シフト形態が登録されました/)).toBeVisible();
    });

    test('シフト形態の複製・テンプレート化', async ({ page }) => {
      // シフト形態管理画面にアクセス
      await page.goto('/admin/master/shift-types');

      // 既存のシフト形態を選択
      await page.getByText(/早番/).click();

      // 複製ボタンをクリック
      await page.getByRole('button', { name: /複製/ }).click();

      // 複製フォームが表示されることを確認
      await expect(page.getByText(/シフト形態複製/)).toBeVisible();

      // 複製名を変更
      await page.getByLabel(/シフト形態名/).fill('早番（土日）');

      // 土日のみ適用するように設定
      await page.getByLabel(/適用曜日/).selectOption('土日');

      // 複製を実行
      await page.getByRole('button', { name: /複製/ }).click();

      // 複製完了メッセージが表示されることを確認
      await expect(page.getByText(/シフト形態が複製されました/)).toBeVisible();
    });
  });

  test.describe('役職・技能管理機能', () => {
    test.beforeEach(async ({ page }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();
    });

    test('役職の登録・管理', async ({ page }) => {
      // 役職管理画面にアクセス
      await page.goto('/admin/master/positions');
      await expect(
        page.getByRole('heading', { name: /役職管理/ })
      ).toBeVisible();

      // 新規登録ボタンをクリック
      await page.getByRole('button', { name: /新規登録/ }).click();

      // 役職登録フォームが表示されることを確認
      await expect(page.getByText(/役職登録/)).toBeVisible();

      // 基本情報を入力
      await page.getByLabel(/役職名/).fill('主任介護福祉士');
      await page.getByLabel(/階級/).fill('5');
      await page.getByLabel(/基本給/).fill('280000');

      // 必要資格を設定
      await page.getByLabel(/必要資格/).selectOption('介護福祉士');
      await page.getByLabel(/経験年数/).fill('5');

      // 登録を実行
      await page.getByRole('button', { name: /登録/ }).click();

      // 登録完了メッセージが表示されることを確認
      await expect(page.getByText(/役職が登録されました/)).toBeVisible();
    });

    test('技能の登録・管理', async ({ page }) => {
      // 技能管理画面にアクセス
      await page.goto('/admin/master/skills');
      await expect(
        page.getByRole('heading', { name: /技能管理/ })
      ).toBeVisible();

      // 新規登録ボタンをクリック
      await page.getByRole('button', { name: /新規登録/ }).click();

      // 技能登録フォームが表示されることを確認
      await expect(page.getByText(/技能登録/)).toBeVisible();

      // 基本情報を入力
      await page.getByLabel(/技能名/).fill('胃ろう管理');
      await page.getByLabel(/技能カテゴリ/).selectOption('医療処置');
      await page.getByLabel(/必要資格/).selectOption('看護師');

      // 技能レベルを設定
      await page.getByLabel(/初級/).fill('胃ろうの基本知識');
      await page.getByLabel(/中級/).fill('胃ろうの管理・交換');
      await page.getByLabel(/上級/).fill('胃ろうの合併症対応');

      // 登録を実行
      await page.getByRole('button', { name: /登録/ }).click();

      // 登録完了メッセージが表示されることを確認
      await expect(page.getByText(/技能が登録されました/)).toBeVisible();
    });

    test('職員技能の割り当て・管理', async ({ page }) => {
      // 職員技能管理画面にアクセス
      await page.goto('/admin/staff-skills');
      await expect(
        page.getByRole('heading', { name: /職員技能管理/ })
      ).toBeVisible();

      // 職員を選択
      await page.getByLabel(/職員選択/).selectOption('田中 次郎');

      // 技能割り当てボタンをクリック
      await page.getByRole('button', { name: /技能割り当て/ }).click();

      // 技能割り当てフォームが表示されることを確認
      await expect(page.getByText(/技能割り当て/)).toBeVisible();

      // 技能を選択
      await page.getByLabel(/食事介助/).check();
      await page.getByLabel(/排泄介助/).check();
      await page.getByLabel(/移乗介助/).check();

      // 技能レベルを設定
      await page.getByLabel(/食事介助レベル/).selectOption('上級');
      await page.getByLabel(/排泄介助レベル/).selectOption('中級');
      await page.getByLabel(/移乗介助レベル/).selectOption('上級');

      // 割り当てを実行
      await page.getByRole('button', { name: /割り当て/ }).click();

      // 割り当て完了メッセージが表示されることを確認
      await expect(page.getByText(/技能が割り当てられました/)).toBeVisible();
    });
  });

  test.describe('配置ルール・テンプレート管理機能', () => {
    test.beforeEach(async ({ page }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();
    });

    test('配置ルールの作成・管理', async ({ page }) => {
      // 配置ルール管理画面にアクセス
      await page.goto('/admin/master/placement-rules');
      await expect(
        page.getByRole('heading', { name: /配置ルール管理/ })
      ).toBeVisible();

      // 新規作成ボタンをクリック
      await page.getByRole('button', { name: /新規作成/ }).click();

      // 配置ルール作成フォームが表示されることを確認
      await expect(page.getByText(/配置ルール作成/)).toBeVisible();

      // 基本情報を入力
      await page.getByLabel(/ルール名/).fill('平日基本配置');
      await page.getByLabel(/適用曜日/).selectOption('月火水木金');

      // 必要人数を設定
      await page.getByLabel(/早番必要人数/).fill('2');
      await page.getByLabel(/日勤必要人数/).fill('4');
      await page.getByLabel(/遅番必要人数/).fill('2');

      // 必要資格を設定
      await page.getByLabel(/看護師必要人数/).fill('1');
      await page.getByLabel(/介護福祉士必要人数/).fill('3');

      // 作成を実行
      await page.getByRole('button', { name: /作成/ }).click();

      // 作成完了メッセージが表示されることを確認
      await expect(page.getByText(/配置ルールが作成されました/)).toBeVisible();
    });

    test('配置テンプレートの作成・管理', async ({ page }) => {
      // 配置テンプレート管理画面にアクセス
      await page.goto('/admin/master/placement-templates');
      await expect(
        page.getByRole('heading', { name: /配置テンプレート管理/ })
      ).toBeVisible();

      // 新規作成ボタンをクリック
      await page.getByRole('button', { name: /新規作成/ }).click();

      // 配置テンプレート作成フォームが表示されることを確認
      await expect(page.getByText(/配置テンプレート作成/)).toBeVisible();

      // 基本情報を入力
      await page.getByLabel(/テンプレート名/).fill('3階フロア配置');
      await page.getByLabel(/適用フロア/).selectOption('3階');

      // 時間帯別配置を設定
      await page.getByLabel(/早番時間帯/).fill('06:00-14:00');
      await page.getByLabel(/日勤時間帯/).fill('08:00-17:00');
      await page.getByLabel(/遅番時間帯/).fill('14:00-22:00');

      // 必要技能を設定
      await page.getByLabel(/必要技能/).selectOption('食事介助');
      await page.getByLabel(/必要技能/).selectOption('排泄介助');

      // 作成を実行
      await page.getByRole('button', { name: /作成/ }).click();

      // 作成完了メッセージが表示されることを確認
      await expect(
        page.getByText(/配置テンプレートが作成されました/)
      ).toBeVisible();
    });
  });

  test.describe('システム設定・カスタマイズ機能', () => {
    test.beforeEach(async ({ page }) => {
      // 施設長としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.owner.email);
      await page.getByLabel('パスワード').fill(testUsers.owner.password);
      await page.getByRole('button', { name: 'ログイン' }).click();
    });

    test('システム基本設定の変更', async ({ page }) => {
      // システム設定画面にアクセス
      await page.goto('/admin/settings/system');
      await expect(
        page.getByRole('heading', { name: /システム設定/ })
      ).toBeVisible();

      // 基本設定タブをクリック
      await page.getByRole('tab', { name: /基本設定/ }).click();

      // 施設情報を編集
      await page.getByLabel(/施設名/).fill('みつまるケア 新宿センター');
      await page.getByLabel(/住所/).fill('東京都新宿区西新宿1-1-1');
      await page.getByLabel(/電話番号/).fill('03-1234-5678');

      // 勤務時間設定を変更
      await page.getByLabel(/標準勤務時間/).fill('8');
      await page.getByLabel(/残業時間上限/).fill('45');

      // 変更を保存
      await page.getByRole('button', { name: /保存/ }).click();

      // 保存完了メッセージが表示されることを確認
      await expect(page.getByText(/設定が保存されました/)).toBeVisible();
    });

    test('通知設定の管理', async ({ page }) => {
      // システム設定画面にアクセス
      await page.goto('/admin/settings/notifications');
      await expect(
        page.getByRole('heading', { name: /通知設定/ })
      ).toBeVisible();

      // メール通知設定を変更
      await page.getByLabel(/シフト確定通知/).check();
      await page.getByLabel(/休暇申請通知/).check();
      await page.getByLabel(/勤怠異常通知/).check();

      // 通知テンプレートを編集
      await page
        .getByLabel(/シフト確定通知テンプレート/)
        .fill('シフトが確定されました。確認してください。');
      await page
        .getByLabel(/休暇申請通知テンプレート/)
        .fill('新しい休暇申請があります。承認をお願いします。');

      // 変更を保存
      await page.getByRole('button', { name: /保存/ }).click();

      // 保存完了メッセージが表示されることを確認
      await expect(page.getByText(/通知設定が保存されました/)).toBeVisible();
    });

    test('ユーザー権限の管理', async ({ page }) => {
      // ユーザー権限管理画面にアクセス
      await page.goto('/admin/settings/permissions');
      await expect(
        page.getByRole('heading', { name: /ユーザー権限管理/ })
      ).toBeVisible();

      // 権限ロールを選択
      await page.getByLabel(/権限ロール/).selectOption('主任');

      // 権限を設定
      await page.getByLabel(/シフト管理/).check();
      await page.getByLabel(/勤怠管理/).check();
      await page.getByLabel(/職員管理/).check();
      await page.getByLabel(/システム設定/).uncheck();

      // 変更を保存
      await page.getByRole('button', { name: /保存/ }).click();

      // 保存完了メッセージが表示されることを確認
      await expect(page.getByText(/権限設定が保存されました/)).toBeVisible();
    });
  });

  test.describe('データインポート・エクスポート機能', () => {
    test.beforeEach(async ({ page }) => {
      // 管理者としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.admin.email);
      await page.getByLabel('パスワード').fill(testUsers.admin.password);
      await page.getByRole('button', { name: 'ログイン' }).click();
    });

    test('職員データの一括インポート', async ({ page }) => {
      // 職員管理画面にアクセス
      await page.goto('/admin/staff');

      // 一括インポートボタンをクリック
      await page.getByRole('button', { name: /一括インポート/ }).click();

      // インポートフォームが表示されることを確認
      await expect(page.getByText(/一括インポート/)).toBeVisible();

      // CSVファイルを選択
      const fileInput = page.getByLabel(/CSVファイル/);
      await fileInput.setInputFiles('test-files/staff-import.csv');

      // インポート設定を確認
      await page.getByLabel(/ヘッダー行をスキップ/).check();
      await page.getByLabel(/重複チェック/).check();

      // インポートを実行
      await page.getByRole('button', { name: /インポート/ }).click();

      // インポート完了メッセージが表示されることを確認
      await expect(page.getByText(/インポートが完了しました/)).toBeVisible();
    });

    test('マスターデータのエクスポート', async ({ page }) => {
      // マスターデータ管理画面にアクセス
      await page.goto('/admin/master');

      // エクスポートボタンをクリック
      await page.getByRole('button', { name: /エクスポート/ }).click();

      // エクスポートフォームが表示されることを確認
      await expect(page.getByText(/データエクスポート/)).toBeVisible();

      // エクスポート対象を選択
      await page.getByLabel(/職員データ/).check();
      await page.getByLabel(/シフト形態/).check();
      await page.getByLabel(/役職データ/).check();

      // エクスポート形式を選択
      await page.getByLabel(/エクスポート形式/).selectOption('Excel');

      // エクスポートを実行
      await page.getByRole('button', { name: /エクスポート/ }).click();

      // エクスポート完了メッセージが表示されることを確認
      await expect(page.getByText(/エクスポートが完了しました/)).toBeVisible();
    });
  });

  test.describe('データバックアップ・復元機能', () => {
    test.beforeEach(async ({ page }) => {
      // 施設長としてログイン
      await page.getByLabel('メールアドレス').fill(testUsers.owner.email);
      await page.getByLabel('パスワード').fill(testUsers.owner.password);
      await page.getByRole('button', { name: 'ログイン' }).click();
    });

    test('データバックアップの作成', async ({ page }) => {
      // バックアップ管理画面にアクセス
      await page.goto('/admin/settings/backup');
      await expect(
        page.getByRole('heading', { name: /バックアップ管理/ })
      ).toBeVisible();

      // バックアップ作成ボタンをクリック
      await page.getByRole('button', { name: /バックアップ作成/ }).click();

      // バックアップ設定を確認
      await page.getByLabel(/全データ/).check();
      await page.getByLabel(/設定のみ/).uncheck();

      // バックアップ名を入力
      await page.getByLabel(/バックアップ名/).fill('2025年3月度バックアップ');

      // バックアップを実行
      await page.getByRole('button', { name: /実行/ }).click();

      // バックアップ完了メッセージが表示されることを確認
      await expect(page.getByText(/バックアップが完了しました/)).toBeVisible();
    });

    test('データ復元の実行', async ({ page }) => {
      // バックアップ管理画面にアクセス
      await page.goto('/admin/settings/backup');

      // 復元対象のバックアップを選択
      await page.getByText(/2025年3月度バックアップ/).click();

      // 復元ボタンをクリック
      await page.getByRole('button', { name: /復元/ }).click();

      // 復元確認ダイアログが表示されることを確認
      await expect(page.getByText(/データを復元しますか/)).toBeVisible();

      // 復元を実行
      await page.getByRole('button', { name: /復元/ }).click();

      // 復元完了メッセージが表示されることを確認
      await expect(page.getByText(/データ復元が完了しました/)).toBeVisible();
    });
  });
});
