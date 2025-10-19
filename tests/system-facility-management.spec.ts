import { expect, test } from '@playwright/test';

// テスト用の認証情報
const SYSTEM_ADMIN_EMAIL = 'admin@mitsumaru-care.com';
const SYSTEM_ADMIN_PASSWORD = 'password123';
const FACILITY_ADMIN_EMAIL = 'facility1@mitsumaru-care.com';
const FACILITY_ADMIN_PASSWORD = 'password123';
const USER_EMAIL = 'user1@mitsumaru-care.com';
const USER_PASSWORD = 'password123';

// テスト用の施設データ（一意性を保つためタイムスタンプを使用）
const getTestFacility = (suffix: string) => {
  // メールアドレス用のサフィックス（日本語文字を除去）
  const emailSuffix = suffix.replace(/[^\w]/g, '').toLowerCase();

  return {
    name: `テスト施設_${suffix}_${Date.now()}`,
    address: `東京都渋谷区テスト${suffix}_${Date.now()}`,
    phone: `03-1234-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')}`,
    email: `test_${emailSuffix}_${Date.now()}@facility.com`,
  };
};

// ログイン関数
async function loginAs(page: any, email: string, password: string) {
  try {
    await page.goto('/login');
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    // ログイン後のリダイレクトを待機
    await page.waitForLoadState('networkidle');

    // ログイン成功の確認（より柔軟なURLチェック）
    if (email === SYSTEM_ADMIN_EMAIL) {
      await page.waitForURL(/\/system\/dashboard/, { timeout: 10000 });
    } else if (email === FACILITY_ADMIN_EMAIL) {
      await page.waitForURL(/\/facility\/dashboard/, { timeout: 10000 });
    } else if (email === USER_EMAIL) {
      await page.waitForURL(/\/user\/dashboard/, { timeout: 10000 });
    }
  } catch (error) {
    console.error('Login failed:', error);
    console.log('Current URL:', page.url());
    throw error;
  }
}

// ログアウト関数
async function logout(page: any) {
  try {
    // ページが閉じられていないかチェック
    if (page.isClosed()) {
      return;
    }

    // ダイアログが開いている場合は閉じる
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    await page.click('button:has-text("ログアウト")', { timeout: 5000 });
    await page.waitForURL('/login', { timeout: 5000 });
  } catch (error) {
    // ログアウトボタンが見つからない場合やページが閉じられている場合は何もしない
    console.log('Logout failed or page closed:', error);
  }
}

// 施設作成ヘルパー関数
async function createTestFacility(
  page: any,
  facilityData = getTestFacility('default')
) {
  // ページが完全に読み込まれるまで待機
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // 追加ボタンが表示されるまで待機（より堅牢な待機処理）
  await page.waitForSelector('[data-testid="add-facility"]', {
    timeout: 15000,
  });

  // ボタンがクリック可能になるまで待機
  await page.waitForFunction(
    () => {
      const button = document.querySelector('[data-testid="add-facility"]');
      return button && !button.hasAttribute('disabled');
    },
    { timeout: 10000 }
  );

  await page.click('[data-testid="add-facility"]');
  await page.waitForSelector('[data-testid="create-facility-dialog"]');

  await page.fill('input[id="name"]', facilityData.name);
  await page.fill('input[id="address"]', facilityData.address);
  await page.fill('input[id="phone"]', facilityData.phone);
  await page.fill('input[id="email"]', facilityData.email);

  // フォームの状態を確認
  console.log('フォーム入力完了');

  // 作成ボタンが有効かチェック
  const createButton = page.locator('[data-testid="create-facility-button"]');
  const isDisabled = await createButton.isDisabled();
  console.log('作成ボタンの状態:', isDisabled ? '無効' : '有効');

  // 作成ボタンをクリック
  await createButton.click();
  console.log('作成ボタンをクリックしました');

  // エラーメッセージが表示されていないかチェック
  await page.waitForTimeout(2000);

  // 簡単なエラーチェック
  const errorMessages = page.locator(
    'text=エラー, text=失敗, text=error, text=failed, .text-red-500, .text-destructive'
  );
  const errorCount = await errorMessages.count();
  if (errorCount > 0) {
    console.log(
      'エラーメッセージが表示されています:',
      await errorMessages.allTextContents()
    );
  }

  // ダイアログが閉じるまで待機（作成が完了した証拠）
  try {
    await page.waitForSelector('[data-testid="create-facility-dialog"]', {
      state: 'hidden',
      timeout: 5000,
    });
    console.log('ダイアログが閉じました');
  } catch (error) {
    console.log('ダイアログが閉じませんでした。手動で閉じます。');
    await page.keyboard.press('Escape');
  }

  // 追加の待機時間
  await page.waitForTimeout(1000);

  // 作成後のデータが表示されるまで待機
  await page.waitForFunction(
    () => {
      const rows = document.querySelectorAll('tbody tr');
      return rows.length > 0;
    },
    { timeout: 10000 }
  );
}

// 施設削除ヘルパー関数
async function deleteTestFacility(page: any) {
  const facilityRows = page.locator('tbody tr');
  const facilityCount = await facilityRows.count();

  if (facilityCount > 0) {
    const deleteButton = page
      .locator('[data-testid="delete-facility"]')
      .first();
    if (await deleteButton.isVisible()) {
      // 削除ボタンをクリック
      await deleteButton.click();

      // アプリケーションの削除確認ダイアログが表示されるまで待機
      await page.waitForSelector('[data-testid="delete-confirmation-dialog"]', {
        timeout: 5000,
      });

      // 削除ボタンをクリック
      await page.click('[data-testid="confirm-delete-button"]');

      // 削除完了を待機
      await page.waitForTimeout(2000);
    }
  }
}

test.describe('システム管理者向け施設管理', () => {
  test.setTimeout(60000); // 各テストのタイムアウトを60秒に設定

  test.beforeEach(async ({ page }) => {
    await loginAs(page, SYSTEM_ADMIN_EMAIL, SYSTEM_ADMIN_PASSWORD);
    await page.goto('/system/facilities');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // コンポーネントのレンダリングを待機

    // テスト間の独立性を確保するため、ページをリフレッシュ
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('施設管理画面にアクセスできる', async ({ page }) => {
    // ページタイトルが表示される
    await expect(
      page.locator(
        'h1:has-text("施設管理"), header span:has-text("施設管理"), [data-testid="page-title"]:has-text("施設管理")'
      )
    ).toBeVisible();
  });

  test('施設一覧が表示される', async ({ page }) => {
    // 施設一覧テーブルが表示される
    await expect(page.locator('table')).toBeVisible();

    // テーブルヘッダーが正しく表示される
    await expect(page.locator('th:has-text("施設名")')).toBeVisible();
    await expect(page.locator('th:has-text("住所")')).toBeVisible();
    await expect(page.locator('th:has-text("電話番号")')).toBeVisible();
    await expect(page.locator('th:has-text("メール")')).toBeVisible();
    await expect(page.locator('th:has-text("ユーザー数")')).toBeVisible();
    await expect(page.locator('th:has-text("登録日")')).toBeVisible();
    await expect(page.locator('th:has-text("操作")')).toBeVisible();
  });

  test('統計情報が表示される', async ({ page }) => {
    // 統計カードが表示される（より簡単なセレクターを使用）
    await expect(page.locator('text=総施設数')).toBeVisible();
    await expect(page.locator('text=総ユーザー数')).toBeVisible();
    await expect(page.locator('text=アクティブユーザー')).toBeVisible();
    await expect(page.locator('text=勤怠記録数')).toBeVisible();
  });

  test('施設検索機能が動作する', async ({ page }) => {
    // 検索ボックスが表示されるまで待機
    await page.waitForSelector('input[placeholder="施設を検索..."]', {
      timeout: 10000,
    });

    // 検索ボックスにテキストを入力
    await page.fill('input[placeholder="施設を検索..."]', 'テスト');
    await page.waitForTimeout(1000); // 検索結果の読み込みを待機

    // 検索結果が表示される（テーブルまたは読み込み中メッセージ）
    await expect(
      page.locator(
        'table, .text-center:has-text("読み込み中"), .text-center:has-text("該当する施設がありません")'
      )
    ).toBeVisible();
  });

  test('施設作成フォームが表示される', async ({ page }) => {
    // ページが完全に読み込まれるまで待機
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 施設追加ボタンをクリック
    await page.waitForSelector('[data-testid="add-facility"]', {
      timeout: 10000,
    });
    await page.click('[data-testid="add-facility"]');

    // ダイアログが開くまで待機
    await page.waitForSelector('input[id="name"]');

    // フォーム要素が表示されることを確認
    await expect(page.locator('text=新しい施設を作成')).toBeVisible();
    await expect(page.locator('input[id="name"]')).toBeVisible();
    await expect(page.locator('input[id="address"]')).toBeVisible();
    await expect(page.locator('input[id="phone"]')).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("施設を作成")')).toBeVisible();

    // Dialogを閉じる
    await page.keyboard.press('Escape');
  });

  test('施設作成のバリデーションが動作する', async ({ page }) => {
    // ページが完全に読み込まれるまで待機
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 施設追加ボタンをクリック
    await page.waitForSelector('[data-testid="add-facility"]', {
      timeout: 15000,
    });

    // ボタンがクリック可能になるまで待機
    await page.waitForFunction(
      () => {
        const button = document.querySelector('[data-testid="add-facility"]');
        return button && !button.hasAttribute('disabled');
      },
      { timeout: 10000 }
    );

    await page.click('[data-testid="add-facility"]');
    await page.waitForSelector('input[id="name"]');

    // 必須項目（施設名）を空にして送信
    await page.fill('input[id="name"]', '');
    await page.click('button:has-text("施設を作成")');

    // バリデーションエラーが表示されることを確認（HTML5のバリデーション）
    await expect(page.locator('input[id="name"]:invalid')).toBeVisible();

    // Dialogを閉じる
    await page.keyboard.press('Escape');
  });

  test('施設作成が成功する', async ({ page }) => {
    // ネットワークリクエストを監視
    const requests: any[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/trpc/facilities.createFacility')) {
        requests.push({
          url: request.url(),
          headers: request.headers(),
          method: request.method(),
        });
      }
    });

    // 個別のテスト施設データを作成
    const testFacility = getTestFacility('作成');

    // テスト施設を作成
    await createTestFacility(page, testFacility);

    // 作成後の状態を確認（エラーメッセージがないかチェック）
    await page.waitForTimeout(3000);

    // ネットワークリクエストのログ出力
    console.log('APIリクエスト数:', requests.length);
    if (requests.length > 0) {
      console.log('APIリクエスト詳細:', JSON.stringify(requests[0], null, 2));
    }

    // エラーメッセージが表示されていないことを確認
    const errorMessages = page.locator(
      'text=エラー, text=失敗, text=error, text=failed'
    );
    const errorCount = await errorMessages.count();
    if (errorCount > 0) {
      console.log(
        'エラーメッセージが表示されています:',
        await errorMessages.allTextContents()
      );
    }

    // ページをリフレッシュしてデータが反映されるのを待つ
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // テーブルの内容をデバッグ出力
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    console.log(`テーブル行数: ${rowCount}`);

    for (let i = 0; i < Math.min(rowCount, 5); i++) {
      const row = tableRows.nth(i);
      const cells = row.locator('td');
      const cellCount = await cells.count();
      if (cellCount > 0) {
        const firstCell = cells.first();
        const text = await firstCell.textContent();
        console.log(`行 ${i + 1}: ${text}`);
      }
    }

    // 作成した施設が一覧に表示されることを確認
    await expect(page.locator(`text=${testFacility.name}`)).toBeVisible();
    await expect(page.locator(`text=${testFacility.address}`)).toBeVisible();
    await expect(page.locator(`text=${testFacility.phone}`)).toBeVisible();
    await expect(page.locator(`text=${testFacility.email}`)).toBeVisible();

    // テストデータをクリーンアップ
    await deleteTestFacility(page);
  });

  test('施設編集フォームが表示される', async ({ page }) => {
    // ページが完全に読み込まれるまで待機
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 個別のテスト施設データを作成
    const testFacility = getTestFacility('編集フォーム');

    // テスト施設を作成
    await createTestFacility(page, testFacility);

    // ページをリフレッシュしてデータが反映されるのを待つ
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // テーブルにデータが表示されるまで待機（より堅牢な待機処理）
    await page.waitForFunction(
      () => {
        const rows = document.querySelectorAll('tbody tr');
        return rows.length > 0;
      },
      { timeout: 15000 }
    );

    // 追加の待機時間
    await page.waitForTimeout(1000);

    // 編集ボタンをクリック
    const editButton = page.locator('[data-testid="edit-facility"]').first();
    await editButton.click();

    // 編集ダイアログが開くまで待機
    await page.waitForSelector('input[id="edit-name"]', { timeout: 10000 });

    // 編集フォームが表示されることを確認
    await expect(page.locator('text=施設を編集')).toBeVisible();
    await expect(page.locator('input[id="edit-name"]')).toBeVisible();
    await expect(page.locator('input[id="edit-address"]')).toBeVisible();
    await expect(page.locator('input[id="edit-phone"]')).toBeVisible();
    await expect(page.locator('input[id="edit-email"]')).toBeVisible();
    await expect(page.locator('button:has-text("施設を更新")')).toBeVisible();

    // Dialogを閉じる
    await page.keyboard.press('Escape');

    // テストデータをクリーンアップ
    await deleteTestFacility(page);
  });

  test('施設編集が成功する', async ({ page }) => {
    // ページが完全に読み込まれるまで待機
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // ネットワークリクエストを監視
    const requests: any[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/trpc/facilities.updateFacility')) {
        requests.push({
          url: request.url(),
          headers: request.headers(),
          method: request.method(),
        });
      }
    });

    // 個別のテスト施設データを作成
    const testFacility = getTestFacility('編集');

    // テスト施設を作成
    await createTestFacility(page, testFacility);

    // ページをリフレッシュしてデータが反映されるのを待つ
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // テーブルにデータが表示されるまで待機
    await page.waitForFunction(
      () => {
        const rows = document.querySelectorAll('tbody tr');
        return rows.length > 0;
      },
      { timeout: 10000 }
    );

    // 編集ボタンをクリック
    const editButton = page.locator('[data-testid="edit-facility"]').first();
    await editButton.click();

    // 編集ダイアログが開くまで待機
    await page.waitForSelector('[data-testid="edit-facility-dialog"]', {
      timeout: 10000,
    });

    // 施設名を変更
    const updatedName = `更新されたテスト施設_${Date.now()}`;
    await page.fill('input[id="edit-name"]', updatedName);

    // 更新ボタンの状態を確認
    const updateButton = page.locator('[data-testid="update-facility-button"]');
    const isDisabled = await updateButton.isDisabled();
    console.log('更新ボタンの状態:', isDisabled ? '無効' : '有効');

    // 更新ボタンをクリック
    await updateButton.click();
    console.log('更新ボタンをクリックしました');

    // 編集ダイアログが閉じるまで待機
    try {
      await page.waitForSelector('[data-testid="edit-facility-dialog"]', {
        state: 'hidden',
        timeout: 5000,
      });
      console.log('編集ダイアログが閉じました');
    } catch (error) {
      console.log('編集ダイアログが閉じませんでした。手動で閉じます。');
      await page.keyboard.press('Escape');
    }

    // ネットワークリクエストのログ出力
    console.log('更新APIリクエスト数:', requests.length);
    if (requests.length > 0) {
      console.log(
        '更新APIリクエスト詳細:',
        JSON.stringify(requests[0], null, 2)
      );
    }

    // ページをリフレッシュして更新が反映されるのを待つ
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 更新が反映されることを確認（より堅牢な待機処理）
    await page.waitForFunction(
      name => {
        const rows = document.querySelectorAll('tbody tr');
        return Array.from(rows).some(row => row.textContent?.includes(name));
      },
      updatedName,
      { timeout: 10000 }
    );
    await expect(page.locator(`text=${updatedName}`)).toBeVisible();

    // テストデータをクリーンアップ
    await deleteTestFacility(page);
  });

  test('施設削除確認ダイアログが表示される', async ({ page }) => {
    // 個別のテスト施設データを作成
    const testFacility = getTestFacility('削除確認');

    // テスト施設を作成
    await createTestFacility(page, testFacility);

    // ページをリフレッシュしてデータが反映されるのを待つ
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // テーブルにデータが表示されるまで待機（より堅牢な待機処理）
    await page.waitForFunction(
      () => {
        const rows = document.querySelectorAll('tbody tr');
        return rows.length > 0;
      },
      { timeout: 15000 }
    );

    // 追加の待機時間
    await page.waitForTimeout(1000);

    // 削除ボタンをクリック
    const deleteButton = page
      .locator('[data-testid="delete-facility"]')
      .first();

    // 削除ボタンをクリック
    await deleteButton.click();

    // アプリケーションの削除確認ダイアログが表示されることを確認
    await page.waitForSelector('[data-testid="delete-confirmation-dialog"]', {
      timeout: 5000,
    });
    await expect(page.locator('text=施設を削除しますか？')).toBeVisible();
    await expect(
      page.locator('[data-slot="alert-dialog-description"]')
    ).toContainText(testFacility.name);

    // キャンセルボタンをクリック
    await page.click('[data-testid="cancel-delete-button"]');

    // 施設が削除されていないことを確認
    await expect(page.locator(`text=${testFacility.name}`)).toBeVisible();

    // テストデータをクリーンアップ
    await deleteTestFacility(page);
  });

  test('施設削除が成功する', async ({ page }) => {
    // ページが完全に読み込まれるまで待機
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 個別のテスト施設データを作成
    const testFacility = getTestFacility('削除');

    // テスト施設を作成
    await createTestFacility(page, testFacility);

    // ページをリフレッシュしてデータが反映されるのを待つ
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // テーブルにデータが表示されるまで待機（より堅牢な待機処理）
    await page.waitForFunction(
      () => {
        const rows = document.querySelectorAll('tbody tr');
        return rows.length > 0;
      },
      { timeout: 15000 }
    );

    // 追加の待機時間
    await page.waitForTimeout(1000);

    // 削除ボタンをクリック
    const deleteButton = page
      .locator('[data-testid="delete-facility"]')
      .first();

    // 削除ボタンをクリック
    await deleteButton.click();

    // アプリケーションの削除確認ダイアログが表示されるまで待機
    await page.waitForSelector('[data-testid="delete-confirmation-dialog"]', {
      timeout: 5000,
    });

    // 削除ボタンをクリック
    await page.click('[data-testid="confirm-delete-button"]');
    await page.waitForTimeout(2000); // 削除完了を待機

    // ページをリフレッシュして削除が反映されるのを待つ
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 施設が削除されたことを確認（より堅牢な待機処理）
    await page.waitForFunction(
      name => {
        const rows = document.querySelectorAll('tbody tr');
        return !Array.from(rows).some(row => row.textContent?.includes(name));
      },
      testFacility.name,
      { timeout: 10000 }
    );
    await expect(page.locator(`text=${testFacility.name}`)).not.toBeVisible();
  });

  test('ページネーションが動作する', async ({ page }) => {
    // ページネーションが表示される場合のみテスト
    const nextButton = page.locator('button:has-text("次へ")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(1000);

      // ページが変更されたことを確認
      await expect(page.locator('text=2 /')).toBeVisible();

      // 前のページに戻る
      const prevButton = page.locator('button:has-text("前へ")');
      await prevButton.click();
      await page.waitForTimeout(1000);

      // ページが戻ったことを確認
      await expect(page.locator('text=1 /')).toBeVisible();
    }
  });
});

test.describe('権限制御とアクセス管理', () => {
  test.setTimeout(60000); // 各テストのタイムアウトを60秒に設定

  test('システム管理者は施設管理画面にアクセスできる', async ({ page }) => {
    await loginAs(page, SYSTEM_ADMIN_EMAIL, SYSTEM_ADMIN_PASSWORD);

    // 施設管理ページに移動
    await page.goto('/system/facilities');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // コンポーネントのレンダリングを待機

    // ページが正しく表示されることを確認
    await expect(
      page.locator(
        'h1:has-text("施設管理"), header span:has-text("施設管理"), [data-testid="page-title"]:has-text("施設管理"), .text-2xl:has-text("施設管理")'
      )
    ).toBeVisible();

    // 施設追加ボタンが表示されることを確認
    await expect(page.locator('[data-testid="add-facility"]')).toBeVisible();

    await logout(page);
  });

  test('施設管理者は施設管理画面にアクセスできない', async ({ page }) => {
    await loginAs(page, FACILITY_ADMIN_EMAIL, FACILITY_ADMIN_PASSWORD);

    // システム管理者画面にアクセスを試行（リダイレクトされる）
    await page.goto('/system/facilities');
    await page.waitForLoadState('networkidle');

    // 施設管理者のダッシュボードまたはログインページにリダイレクトされる
    await expect(page).toHaveURL(/\/facility\/dashboard|\/login/);

    await logout(page);
  });

  test('一般ユーザーは施設管理画面にアクセスできない', async ({ page }) => {
    await loginAs(page, USER_EMAIL, USER_PASSWORD);

    // システム管理者画面にアクセスを試行（リダイレクトされる）
    await page.goto('/system/facilities');
    await page.waitForLoadState('networkidle');

    // 一般ユーザーのダッシュボードまたはログインページにリダイレクトされる
    await expect(page).toHaveURL(/\/user\/dashboard|\/login/);

    await logout(page);
  });

  test('未認証ユーザーは施設管理画面にアクセスできない', async ({ page }) => {
    // ログインせずにアクセス
    await page.goto('/system/facilities');
    await page.waitForLoadState('networkidle');

    // ログインページにリダイレクトされる
    await expect(page).toHaveURL('/login');
  });

  test('システム管理者は施設管理APIにアクセスできる', async ({ page }) => {
    await loginAs(page, SYSTEM_ADMIN_EMAIL, SYSTEM_ADMIN_PASSWORD);

    // 施設管理ページに移動
    await page.goto('/system/facilities');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // APIが正常に動作することを確認（テーブルが表示される）
    await expect(page.locator('table')).toBeVisible();

    // 統計情報が表示されることを確認
    await expect(
      page.locator('.grid.grid-cols-1.md\\:grid-cols-4.gap-4')
    ).toBeVisible();

    await logout(page);
  });

  test('権限のないユーザーは施設管理APIにアクセスできない', async ({
    page,
  }) => {
    // 施設管理者でログイン
    await loginAs(page, FACILITY_ADMIN_EMAIL, FACILITY_ADMIN_PASSWORD);

    // 直接APIエンドポイントにアクセスを試行
    const response = await page.request.get(
      '/api/trpc/facilities.getFacilities'
    );

    // 401 Unauthorized または 403 Forbidden が返されることを確認
    expect([401, 403]).toContain(response.status());

    await logout(page);
  });
});
