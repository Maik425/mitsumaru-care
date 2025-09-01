// E2Eテスト用の認証ヘルパー

export async function loginAsAdmin(page: any) {
  // 管理者としてログイン
  await page.evaluate(() => {
    localStorage.setItem('userEmail', 'admin@example.com');
    localStorage.setItem('userRole', 'ADMIN');
    localStorage.setItem('userName', '管理者');
    localStorage.setItem('userId', 'admin-001');
    localStorage.setItem('lastActivity', Date.now().toString());
  });
}

export async function loginAsMember(page: any) {
  // 一般職員としてログイン
  await page.evaluate(() => {
    localStorage.setItem('userEmail', 'member@example.com');
    localStorage.setItem('userRole', 'MEMBER');
    localStorage.setItem('userName', '一般職員');
    localStorage.setItem('userId', 'member-001');
    localStorage.setItem('lastActivity', Date.now().toString());
  });
}

export async function logout(page: any) {
  // ログアウト
  await page.evaluate(() => {
    localStorage.clear();
  });
}

export async function setAuthToken(page: any, token: string) {
  // 認証トークンを設定
  await page.evaluate((token: string) => {
    localStorage.setItem('auth-token', token);
  }, token);
}
