# 統一サイドバー実装

## 概要

既存の3つのサイドバーコンポーネント（`UserShell`、`FacilityDashboard`、`AdminDashboard`）を統一し、ロールベースの動的メニュー表示を実現しました。

## 実装内容

### 1. 統一サイドバーコンポーネント

#### 新規作成ファイル

- `src/lib/navigation/menu-config.ts` - ロール別メニュー設定
- `src/hooks/use-navigation.ts` - ナビゲーションフック
- `src/components/navigation/unified-sidebar.tsx` - 統一サイドバーコンポーネント
- `src/components/layouts/role-based-layout.tsx` - ロールベースレイアウト

#### 修正ファイル

- `src/app/system/dashboard/page.tsx` - システム管理者ダッシュボード
- `src/app/system/users/page.tsx` - システム管理者ユーザー管理
- `src/app/facility/dashboard/page.tsx` - 施設管理者ダッシュボード
- `src/components/user-dashboard.tsx` - 一般ユーザーダッシュボード
- `src/components/user-attendance.tsx` - 一般ユーザー勤怠申請
- `src/components/user-holidays.tsx` - 一般ユーザー希望休申請

### 2. ロール別メニュー設定

#### システム管理者（system_admin）

- ユーザー管理
- 施設管理
- システム設定
- 監査ログ
- ヘルスチェック
- データエクスポート
- 通知管理

#### 施設管理者（facility_admin）

- シフト詳細設定
- シフト簡単作成
- 休み管理
- 役割表管理
- シフト形態管理
- 役職登録
- 技能登録
- 職種・配置ルール登録
- 役割表登録
- 勤怠管理登録
- ログインアカウント登録
- 勤怠確認

#### 一般ユーザー（user）

- ダッシュボード
- 勤怠申請
- 希望休申請

### 3. 共通機能

- FAQ（全ロール共通）
- ログアウト（全ロール共通）
- アクティブメニューのハイライト
- レスポンシブ対応

### 4. テスト実装

#### 新規作成テストファイル

- `tests/unified-sidebar.spec.ts` - 統一サイドバー機能テスト
- `tests/navigation-hook.spec.ts` - ナビゲーションフックテスト
- `tests/sidebar-integration.spec.ts` - 統合テスト
- `tests/debug-sidebar.spec.ts` - デバッグテスト

#### テスト内容

- ロール別メニュー表示テスト
- メニューナビゲーションテスト
- 権限チェックテスト
- レスポンシブ対応テスト
- アクティブメニューハイライトテスト
- ログアウト機能テスト

## 技術仕様

### アーキテクチャ

```
src/
├── lib/navigation/
│   └── menu-config.ts          # ロール別メニュー設定
├── hooks/
│   └── use-navigation.ts       # ナビゲーションフック
├── components/
│   ├── navigation/
│   │   └── unified-sidebar.tsx # 統一サイドバーコンポーネント
│   └── layouts/
│       └── role-based-layout.tsx # ロールベースレイアウト
```

### 主要コンポーネント

#### UnifiedSidebar

- ロール別メニュー表示
- アクティブメニューハイライト
- ログアウト機能
- レスポンシブ対応

#### RoleBasedLayout

- 認証状態チェック
- ローディング状態表示
- アクセス権限チェック
- UnifiedSidebarの統合

#### useNavigation

- ロール別メニュー設定取得
- 権限チェック
- 認証状態管理

### データフロー

1. ユーザーログイン
2. `useAuth`でユーザー情報取得
3. `useNavigation`でロール別メニュー設定取得
4. `UnifiedSidebar`でメニュー表示
5. メニュークリックでページ遷移

## 使用方法

### 基本的な使用方法

```tsx
import { RoleBasedLayout } from '@/components/layouts/role-based-layout';

export default function MyPage() {
  return (
    <RoleBasedLayout title='ページタイトル' description='ページの説明'>
      {/* ページのコンテンツ */}
    </RoleBasedLayout>
  );
}
```

### メニュー設定の追加

`src/lib/navigation/menu-config.ts`でメニュー設定を追加：

```typescript
const systemMenuConfig: NavigationConfig = {
  role: 'system_admin',
  title: 'みつまるケア',
  subtitle: 'システム管理者画面',
  sections: [
    {
      title: '新しいセクション',
      items: [{ name: '新しいメニュー', href: '/new-page', icon: NewIcon }],
    },
  ],
  commonItems: [{ name: 'FAQ', href: '/faq', icon: HelpCircle }],
};
```

## テスト実行

### 全テスト実行

```bash
pnpm exec playwright test tests/unified-sidebar.spec.ts
```

### 特定のテスト実行

```bash
pnpm exec playwright test tests/unified-sidebar.spec.ts --grep "システム管理者"
```

### デバッグモード実行

```bash
pnpm exec playwright test tests/unified-sidebar.spec.ts --headed --debug
```

## 今後の拡張

### 予定されている機能

1. **メニューの動的表示/非表示**
   - 権限に基づくメニューの動的制御
   - 機能フラグによるメニュー表示制御

2. **メニューのカスタマイズ**
   - ユーザーによるメニューの並び替え
   - お気に入りメニューの設定

3. **多言語対応**
   - メニュー名の多言語化
   - ロケールに基づくメニュー表示

4. **メニューの階層化**
   - サブメニューの実装
   - メニューのグループ化

## 注意事項

### 既存コンポーネントの置き換え

- `UserShell`、`FacilityDashboard`、`AdminDashboard`は段階的に置き換え
- 既存の機能は維持しつつ、統一されたUIを提供

### パフォーマンス

- メニュー設定は静的に定義され、実行時のオーバーヘッドは最小限
- 認証状態の変更時のみメニューの再描画が発生

### セキュリティ

- フロントエンドでのメニュー表示制御
- 実際のアクセス制御はバックエンドで実装
- 権限のないページへのアクセスは適切にブロック

## 関連ファイル

- [OpenSpec提案書](../../openspec/changes/add-role-based-sidebar/proposal.md)
- [実装タスク](../../openspec/changes/add-role-based-sidebar/tasks.md)
- [仕様書](../../openspec/changes/add-role-based-sidebar/specs/navigation/spec.md)
