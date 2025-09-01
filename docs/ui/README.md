# 画面設計書

## 📋 1. 概要

このドキュメントでは、みつまるケアシステムのユーザーインターフェース（UI）設計について詳細に説明します。

### 1.1 設計方針

- **ユーザビリティ優先** - 直感的で使いやすいインターフェース
- **レスポンシブデザイン** - PC・タブレット・スマートフォン対応
- **アクセシビリティ** - 高齢者にも使いやすいデザイン
- **一貫性** - 全画面で統一されたデザインシステム

### 1.2 デザインシステム

- **フレームワーク**: shadcn/ui + Tailwind CSS
- **カラーパレット**: 介護施設に適した落ち着いた色調
- **タイポグラフィ**: 読みやすいフォントとサイズ
- **アイコン**: Lucide React アイコンセット

## 🚀 実装状況

### ✅ 実装済み画面・コンポーネント

#### 1. 基本レイアウト・認証

- **ログイン画面** (`app/page.tsx`) - ✅ 実装済み
- **ログインフォーム** (`components/login-form.tsx`) - ✅ 実装済み
- **メインレイアウト** (`app/layout.tsx`) - ✅ 実装済み

#### 2. 管理者機能

- **管理者ダッシュボード** (`app/admin/dashboard/page.tsx`, `components/admin-dashboard.tsx`) - ✅ 実装済み
- **シフト作成フォーム** (`components/shift-create-form.tsx`) - ✅ 実装済み
- **シフト編集フォーム** (`components/shift-edit-form.tsx`) - ✅ 実装済み
- **シフト交換システム** (`components/shift-exchange-system.tsx`) - ✅ 実装済み
- **役割管理** (`components/role-management.tsx`) - ✅ 実装済み
- **役割テンプレート管理** (`components/role-templates-management.tsx`) - ✅ 実装済み
- **勤怠管理** (`components/attendance-management.tsx`) - ✅ 実装済み
- **勤怠管理設定** (`components/attendance-management-settings.tsx`) - ✅ 実装済み
- **シフト形態管理** (`components/attendance-types-management.tsx`) - ✅ 実装済み
- **役職管理** (`components/positions-management.tsx`) - ✅ 実装済み
- **技能管理** (`components/skills-management.tsx`) - ✅ 実装済み
- **職種・配置ルール管理** (`components/job-rules-management.tsx`) - ✅ 実装済み
- **職員管理** (`components/accounts-management.tsx`) - ✅ 実装済み
- **職員技能管理** (`components/staff-skill-management.tsx`) - ✅ 実装済み
- **休暇管理** (`components/holiday-management.tsx`) - ✅ 実装済み
- **役割表作成ページ** (`app/admin/role-assignments/page.tsx`) - ✅ 追加実装（テスト対応）
- **シフト交換管理ページ** (`app/admin/shift-exchange/page.tsx`) - ✅ 追加実装（テスト対応）

#### 3. 一般職機能

- **一般職ダッシュボード** (`app/user/dashboard/page.tsx`, `components/user-dashboard.tsx`) - ✅ 実装済み
- **勤怠管理** (`app/user/attendance/page.tsx`, `components/user-attendance.tsx`) - ✅ 実装済み
- **休暇管理** (`app/user/holidays/page.tsx`, `components/user-holidays.tsx`) - ✅ 実装済み
- **シフト交換** (`app/user/shift-exchange/page.tsx`) - ✅ 追加実装（テスト対応）

#### 4. 共通コンポーネント

- **時計ウィジェット** (`components/clock-widget.tsx`) - ✅ 実装済み
- **テーマプロバイダー** (`components/theme-provider.tsx`) - ✅ 実装済み
- **UIコンポーネント** (`components/ui/`) - ✅ shadcn/ui実装済み

### 🔄 次に実装が必要な部分

#### 1. API連携

- **tRPCクライアント** - 既存コンポーネントとAPIの連携
- **状態管理** - 認証状態・ユーザー情報の管理
- **エラーハンドリング** - API呼び出し時のエラー処理

#### 2. セキュリティ機能

- **権限チェック** - 各画面での権限確認
- **認証状態の反映** - ログイン状態に応じたUI表示
- **セッション管理** - セッション期限・自動ログアウト

## 🎨 2. デザインガイドライン

### 2.1 カラーパレット

```css
/* プライマリカラー */
--primary: #2563eb; /* 青 - メインアクション */
--primary-foreground: #ffffff;

/* セカンダリカラー */
--secondary: #64748b; /* グレー - サブアクション */
--secondary-foreground: #f8fafc;

/* アクセントカラー */
--accent: #f59e0b; /* オレンジ - 注意・警告 */
--accent-foreground: #ffffff;

/* 成功・エラー・警告 */
--success: #10b981; /* 緑 - 成功 */
--error: #ef4444; /* 赤 - エラー */
--warning: #f59e0b; /* オレンジ - 警告 */

/* 背景色 */
--background: #ffffff; /* 白 - メイン背景 */
--card: #f8fafc; /* ライトグレー - カード背景 */
--muted: #f1f5f9; /* ミュート背景 */
```

### 2.2 タイポグラフィ

```css
/* フォントファミリー */
--font-sans: 'Geist Sans', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'Geist Mono', 'SF Mono', Monaco, monospace;

/* フォントサイズ */
--text-xs: 0.75rem; /* 12px - 補助情報 */
--text-sm: 0.875rem; /* 14px - 小さいテキスト */
--text-base: 1rem; /* 16px - 基本テキスト */
--text-lg: 1.125rem; /* 18px - 見出し */
--text-xl: 1.25rem; /* 20px - 大見出し */
--text-2xl: 1.5rem; /* 24px - ページタイトル */
--text-3xl: 1.875rem; /* 30px - メインタイトル */
```

### 2.3 スペーシング

```css
/* 統一されたスペーシング */
--spacing-1: 0.25rem; /* 4px */
--spacing-2: 0.5rem; /* 8px */
--spacing-3: 0.75rem; /* 12px */
--spacing-4: 1rem; /* 16px */
--spacing-6: 1.5rem; /* 24px */
--spacing-8: 2rem; /* 32px */
--spacing-12: 3rem; /* 48px */
--spacing-16: 4rem; /* 64px */
```

## 🏠 3. 共通レイアウト

### 3.1 メインレイアウト

```tsx
// app/layout.tsx - ✅ 実装済み
export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <Providers>
          <div className="min-h-screen bg-background">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
```

### 3.2 サイドバーレイアウト（管理者・一般職）

```tsx
// 共通サイドバーコンポーネント - ✅ 実装済み
export function SidebarLayout({ children, sidebarContent }) {
  return (
    <SidebarProvider>
      <Sidebar>{sidebarContent}</Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center border-b px-4">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold ml-4">ページタイトル</h1>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

## 🔐 4. 認証画面

### 4.1 ログイン画面

```tsx
// app/page.tsx - ログイン画面 - ✅ 実装済み
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            みつまるケア
          </h1>
          <p className="text-gray-600">介護業務効率化サービス</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
```

### 4.2 ログインフォーム

```tsx
// components/login-form.tsx - ✅ 実装済み
export function LoginForm() {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-xl">ログイン</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            type="email"
            placeholder="example@mitsumaru.com"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">パスワード</Label>
          <Input
            id="password"
            type="password"
            placeholder="パスワードを入力"
            className="h-11"
          />
        </div>
        <Button type="submit" className="w-full h-11">
          ログイン
        </Button>
      </CardContent>
    </Card>
  );
}
```

## 🏢 5. 管理者画面

### 5.1 管理者ダッシュボード

```tsx
// app/admin/dashboard/page.tsx - ✅ 実装済み
export default function AdminDashboardPage() {
  return (
    <SidebarLayout sidebarContent={<AdminSidebar />}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard
            title="今月のシフト"
            value="完了"
            status="success"
            icon={Calendar}
          />
          <DashboardCard
            title="承認待ち"
            value="3件"
            status="warning"
            icon={Clock}
          />
          <DashboardCard
            title="勤務者数"
            value="25名"
            status="info"
            icon={Users}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentShifts />
          <AttendanceAlerts />
        </div>
      </div>
    </SidebarLayout>
  );
}
```

### 5.2 シフト作成画面

```tsx
// app/admin/shift/create/page.tsx - ✅ 実装済み
export default function ShiftCreatePage() {
  return (
    <SidebarLayout sidebarContent={<AdminSidebar />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">月間シフト作成</h1>
          <Button>シフト生成</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ShiftSettings />
          </div>
          <div className="lg:col-span-3">
            <ShiftCalendar />
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
```

### 5.3 シフト設定パネル

```tsx
// components/shift-settings.tsx - ✅ 実装済み
export function ShiftSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>シフト設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>対象月</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="月を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-01">2024年1月</SelectItem>
              <SelectItem value="2024-02">2024年2月</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>シフト形態</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="morning" />
              <Label htmlFor="morning">早番</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="day" />
              <Label htmlFor="day">日勤</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="night" />
              <Label htmlFor="night">夜勤</Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 5.4 シフトカレンダー

```tsx
// components/shift-calendar.tsx - ✅ 実装済み
export function ShiftCalendar() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>シフトカレンダー</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {['日', '月', '火', '水', '木', '金', '土'].map(day => (
            <div key={day} className="p-2 text-center font-medium bg-muted">
              {day}
            </div>
          ))}

          {Array.from({ length: 31 }, (_, i) => (
            <div key={i + 1} className="p-2 border min-h-[80px]">
              <div className="text-sm font-medium mb-1">{i + 1}</div>
              <div className="space-y-1">
                <div className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                  早番: 田中
                </div>
                <div className="text-xs bg-green-100 text-green-800 px-1 rounded">
                  日勤: 佐藤
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

## 👥 6. 一般職画面

### 6.1 一般職ダッシュボード

```tsx
// app/user/dashboard/page.tsx - ✅ 実装済み
export default function UserDashboardPage() {
  return (
    <SidebarLayout sidebarContent={<UserSidebar />}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TodayShift />
          <ClockWidget />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AttendanceStatus />
          <HolidayRequests />
        </div>
      </div>
    </SidebarLayout>
  );
}
```

### 6.2 今日のシフト表示

```tsx
// components/today-shift.tsx - ✅ 実装済み
export function TodayShift() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>今日のシフト</CardTitle>
        <CardDescription>2024年12月19日</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium">早番</div>
              <div className="text-sm text-gray-600">7:00 - 15:00</div>
            </div>
          </div>
          <Badge variant="secondary">食事介助担当</Badge>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">担当業務</div>
          <div className="space-y-1">
            <div className="text-sm text-gray-600">• 8:00-9:00 朝食介助</div>
            <div className="text-sm text-gray-600">• 9:00-10:00 入浴介助</div>
            <div className="text-sm text-gray-600">• 12:00-13:00 昼食介助</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 6.3 勤怠管理画面

```tsx
// app/user/attendance/page.tsx - ✅ 実装済み
export default function AttendancePage() {
  return (
    <SidebarLayout sidebarContent={<UserSidebar />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">勤怠管理</h1>
          <div className="flex space-x-2">
            <Button variant="outline">修正申請</Button>
            <Button>出勤</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AttendanceCalendar />
          </div>
          <div>
            <AttendanceSummary />
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
```

## ⚙️ 7. 設定画面

### 7.1 シフト形態管理

```tsx
// app/admin/settings/attendance-types/page.tsx - ✅ 実装済み
export default function ShiftTypesPage() {
  return (
    <SidebarLayout sidebarContent={<AdminSidebar />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">シフト形態管理</h1>
          <Button>新規作成</Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>シフト名</TableHead>
                  <TableHead>開始時刻</TableHead>
                  <TableHead>終了時刻</TableHead>
                  <TableHead>休憩時間</TableHead>
                  <TableHead>表示色</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>早番</TableCell>
                  <TableCell>7:00</TableCell>
                  <TableCell>15:00</TableCell>
                  <TableCell>60分</TableCell>
                  <TableCell>
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        編集
                      </Button>
                      <Button size="sm" variant="destructive">
                        削除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
```

### 7.2 職員管理画面

```tsx
// app/admin/settings/accounts/page.tsx - ✅ 実装済み
export default function AccountsPage() {
  return (
    <SidebarLayout sidebarContent={<AdminSidebar />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">職員管理</h1>
          <Button>新規登録</Button>
        </div>

        <div className="flex items-center space-x-4">
          <Input placeholder="職員名で検索" className="max-w-sm" />
          <Select>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="役職" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全て</SelectItem>
              <SelectItem value="care">介護福祉士</SelectItem>
              <SelectItem value="nurse">看護師</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>職員名</TableHead>
                  <TableHead>社員番号</TableHead>
                  <TableHead>役職</TableHead>
                  <TableHead>技能</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>田中 花子</TableCell>
                  <TableCell>001</TableCell>
                  <TableCell>介護福祉士</TableCell>
                  <TableCell>食事介助, 入浴介助</TableCell>
                  <TableCell>
                    <Badge variant="success">アクティブ</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        編集
                      </Button>
                      <Button size="sm" variant="outline">
                        詳細
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
```

## 📱 8. レスポンシブデザイン

### 8.1 ブレークポイント

```css
/* Tailwind CSS ブレークポイント */
sm: 640px   /* スマートフォン（横） */
md: 768px   /* タブレット */
lg: 1024px  /* 小型PC */
xl: 1280px  /* 中型PC */
2xl: 1536px /* 大型PC */
```

### 8.2 モバイル対応例

```tsx
// モバイル対応のグリッドレイアウト
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* モバイル: 1列, タブレット: 2列, PC: 3列 */}
</div>

// モバイル対応のサイドバー
<Sidebar className="hidden md:block">
  {/* モバイルでは非表示、タブレット以上で表示 */}
</Sidebar>

// モバイル対応のナビゲーション
<nav className="md:hidden">
  {/* モバイル専用ナビゲーション */}
</nav>
```

## ♿ 9. アクセシビリティ

### 9.1 キーボードナビゲーション

```tsx
// フォーカス可能な要素の管理
<Button
  onKeyDown={e => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  tabIndex={0}
>
  ボタン
</Button>
```

### 9.2 スクリーンリーダー対応

```tsx
// 適切なラベルと説明
<Input
  id="email"
  aria-label="メールアドレス"
  aria-describedby="email-help"
  placeholder="example@mitsumaru.com"
/>
<div id="email-help" className="text-sm text-gray-600">
  職員のメールアドレスを入力してください
</div>

// 状態の説明
<div role="status" aria-live="polite">
  {isLoading ? '読み込み中...' : '完了'}
</div>
```

### 9.3 コントラスト比

```css
/* WCAG AA準拠のコントラスト比 */
--text-primary: #1f2937; /* 背景: #ffffff とのコントラスト比 15.6:1 */
--text-secondary: #6b7280; /* 背景: #ffffff とのコントラスト比 4.5:1 */
--text-muted: #9ca3af; /* 背景: #ffffff とのコントラスト比 2.8:1 */
```

## 🎨 10. コンポーネントライブラリ

### 10.1 基本コンポーネント

```tsx
// カスタムボタンコンポーネント
export function PrimaryButton({ children, ...props }) {
  return (
    <Button
      className="bg-primary hover:bg-primary/90 text-primary-foreground"
      {...props}
    >
      {children}
    </Button>
  );
}

// カスタムカードコンポーネント
export function InfoCard({ title, children, icon: Icon }) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <Icon className="h-4 w-4 text-primary mr-2" />
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
```

### 10.2 データ表示コンポーネント

```tsx
// ステータスバッジ
export function StatusBadge({ status }) {
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${variants[status]}`}
    >
      {status}
    </span>
  );
}

// 時間表示
export function TimeDisplay({ time, format = 'HH:mm' }) {
  return <span className="font-mono text-sm">{formatTime(time, format)}</span>;
}
```

## 💡 実装のポイント

### 1. 既存実装の活用

- **UIコンポーネント**: 既存の画面・フォームをそのまま活用
- **モックデータ置き換え**: 実際のAPI呼び出しに置き換え
- **段階的移行**: 機能ごとに段階的にAPI連携を実装

### 2. 効率的な開発

- **フロントエンド**: 既に実装済みのため、API連携に集中
- **バックエンド**: 設計済みのAPI仕様に基づく実装
- **テスト**: 既存UIを活用した統合テスト

### 3. 次のステップ

- **tRPCクライアント**: 既存コンポーネントとAPIの連携
- **状態管理**: 認証状態・ユーザー情報の管理
- **エラーハンドリング**: API呼び出し時のエラー処理

---

**次段階**: [API設計](./../api/README.md) に進む
