# スクリプト集

このディレクトリには、開発作業を効率化するためのスクリプトが含まれています。

## 完了通知スクリプト

### task-complete.sh

タスク完了時に音を鳴らして通知するスクリプトです。

```bash
# 基本的な使用方法
./scripts/task-complete.sh

# カスタムメッセージ付き
./scripts/task-complete.sh "PR-005が完了しました！"
```

### test-complete.sh

テスト完了時に音を鳴らして通知するスクリプトです。

```bash
# 基本的な使用方法
./scripts/test-complete.sh

# カスタムテスト名付き
./scripts/test-complete.sh "E2Eテスト"
```

## 機能

- **音声通知**: システム音を鳴らしてタスク完了を通知
- **視覚通知**: 色付きのメッセージを表示
- **デスクトップ通知**: macOSではデスクトップ通知も表示
- **クロスプラットフォーム**: macOS、Linux、その他のOSに対応

## 使用例

```bash
# テスト実行後に完了通知
npx playwright test && ./scripts/test-complete.sh

# タスク完了後に通知
./scripts/task-complete.sh "シフト交換APIの実装完了"
```

## 注意事項

- スクリプトに実行権限が必要です（`chmod +x scripts/*.sh`）
- macOSでは追加のシステム音も再生されます
- デスクトップ通知はmacOSでのみ利用可能です
