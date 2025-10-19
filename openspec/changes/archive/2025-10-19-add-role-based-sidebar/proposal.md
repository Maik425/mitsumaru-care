## Why

現在のシステムでは、各ロール（システム管理者、施設管理者、一般ユーザー）用のサイドバーが別々のコンポーネント（UserShell、FacilityDashboard、AdminDashboard）として実装されており、コードの重複と一貫性の欠如が問題となっている。また、権限チェックが不十分で、直接URLアクセス時の制御が弱い。

## What Changes

- 既存の3つのサイドバーコンポーネント（UserShell、FacilityDashboard、AdminDashboard）を統合
- ロール別のメニュー項目を動的に表示する統一サイドバーコンポーネントを実装
- 権限に応じたメニューの表示/非表示制御を強化
- コードの重複を排除し、保守性を向上
- 一貫したナビゲーション構造を実現

## Impact

- Affected specs: navigation
- Affected code:
  - フロントエンド: 既存の3つのサイドバーコンポーネントの統合、統一サイドバーコンポーネントの実装
  - 既存のuseAuthフックを活用（バックエンド変更不要）
  - 既存コンポーネント: UserShell、FacilityDashboard、AdminDashboardの段階的置き換え
