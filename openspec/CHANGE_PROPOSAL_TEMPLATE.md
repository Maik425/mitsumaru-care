# 変更提案テンプレート

## 📝 提案の作成手順

### 1. 変更IDの決定
- **形式**: kebab-case、動詞から始まる (`add-`, `update-`, `remove-`, `refactor-`)
- **例**: `add-user-authentication`, `update-search-performance`, `remove-legacy-api`

### 2. ディレクトリ構造の作成
```
openspec/changes/[change-id]/
├── proposal.md     # 提案の概要
├── tasks.md        # 実装チェックリスト
├── design.md       # 技術的決定事項（必要に応じて）
└── specs/          # 仕様の変更
    └── [capability]/
        └── spec.md # 追加/変更/削除される要件
```

## 📋 proposal.md テンプレート

```markdown
## Why
[問題や機会を1-2文で説明]

## What Changes
- [変更内容の箇条書き]
- [**BREAKING**] 破壊的変更がある場合は明記

## Impact
- 影響を受ける仕様: [機能のリスト]
- 影響を受けるコード: [主要ファイル/システム]
```

## 📋 tasks.md テンプレート

```markdown
## 1. 実装
- [ ] 1.1 データベーススキーマの作成
- [ ] 1.2 APIエンドポイントの実装
- [ ] 1.3 フロントエンドコンポーネントの追加
- [ ] 1.4 テストの作成

## 2. テスト
- [ ] 2.1 単体テストの作成
- [ ] 2.2 統合テストの実行
- [ ] 2.3 E2Eテストの更新

## 3. ドキュメント
- [ ] 3.1 READMEの更新
- [ ] 3.2 APIドキュメントの更新
```

## 📋 design.md テンプレート（必要に応じて）

以下の場合に作成：
- 複数サービス/モジュールにまたがる変更
- 新しい外部依存関係や重要なデータモデル変更
- セキュリティ、パフォーマンス、移行の複雑さ
- コーディング前に技術的決定が必要な曖昧さ

```markdown
## Context
[背景、制約、ステークホルダー]

## Goals / Non-Goals
- Goals: [...]
- Non-Goals: [...]

## Decisions
- Decision: [何を、なぜ]
- Alternatives considered: [選択肢 + 根拠]

## Risks / Trade-offs
- [リスク] → 軽減策

## Migration Plan
[手順、ロールバック]

## Open Questions
- [...]
```

## 📋 spec.md テンプレート

```markdown
## ADDED Requirements
### Requirement: 新機能名
システムは...を提供する必要がある

#### Scenario: 成功ケース
- **WHEN** ユーザーがアクションを実行
- **THEN** 期待される結果

## MODIFIED Requirements
### Requirement: 既存機能名
[完全に修正された要件]

## REMOVED Requirements
### Requirement: 古い機能名
**Reason**: [削除理由]
**Migration**: [対処方法]
```

## 🔍 検証コマンド

```bash
# 変更の検証
openspec validate [change-id] --strict

# 変更の詳細表示
openspec show [change-id]

# 仕様の差分表示
openspec diff [change-id]

# アクティブな変更の一覧
openspec list

# 仕様の一覧
openspec list --specs
```

## ⚠️ 重要な注意事項

1. **承認ゲート**: 実装開始前に提案の承認が必要
2. **シナリオ形式**: `#### Scenario:` を使用（4つのハッシュ）
3. **要件の完全性**: MODIFIED要件は完全な内容を含める
4. **一意性**: 変更IDは一意である必要がある
5. **品質チェック**: 実装前にTypeScript型チェック、テスト実行、ビルド確認を必須
