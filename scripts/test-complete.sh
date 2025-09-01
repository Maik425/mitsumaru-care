#!/bin/bash

# テスト完了通知スクリプト
# 使用方法: ./scripts/test-complete.sh [テスト名]

# デフォルトメッセージ
TEST_NAME=${1:-"E2Eテスト"}
MESSAGE="$TEST_NAMEが完了しました！"

# 色付きでメッセージを表示
echo -e "\033[1;36m🧪 $MESSAGE\033[0m"

# システム音を鳴らす（爆音 + 特徴的な音）
echo -e "\a"  # 基本的なベル音

if [[ "$OSTYPE" == "darwin"* ]]; then
    # 最終爆音のみ（音量2倍）
    echo "💥 最終爆音！"
    # 音量を2倍にするため、同じ音を2回ずつ同時再生
    afplay -v 1.0 /System/Library/Sounds/Basso.aiff &
    afplay -v 1.0 /System/Library/Sounds/Basso.aiff &
    afplay -v 1.0 /System/Library/Sounds/Glass.aiff &
    afplay -v 1.0 /System/Library/Sounds/Glass.aiff &
    afplay -v 1.0 /System/Library/Sounds/Hero.aiff &
    afplay -v 1.0 /System/Library/Sounds/Hero.aiff &
    afplay -v 1.0 /System/Library/Sounds/Sosumi.aiff &
    afplay -v 1.0 /System/Library/Sounds/Sosumi.aiff &
    afplay -v 1.0 /System/Library/Sounds/Blow.aiff &
    afplay -v 1.0 /System/Library/Sounds/Blow.aiff &
    sleep 2
    wait
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux用の音（最終爆音のみ、音量2倍）
    echo "💥 最終爆音！"
    # 音量を2倍にするため、同じ音を2回ずつ同時再生
    paplay --volume=65536 /usr/share/sounds/freedesktop/stereo/complete.oga &
    paplay --volume=65536 /usr/share/sounds/freedesktop/stereo/complete.oga &
    paplay --volume=65536 /usr/share/sounds/freedesktop/stereo/dialog-error.oga &
    paplay --volume=65536 /usr/share/sounds/freedesktop/stereo/dialog-error.oga &
    paplay --volume=65536 /usr/share/sounds/freedesktop/stereo/message.oga &
    paplay --volume=65536 /usr/share/sounds/freedesktop/stereo/message.oga &
    sleep 2
    wait
else
    # その他のOS用（最終爆音のみ）
    echo "💥 最終爆音！"
    # ベル音を2倍の回数で再生
    for i in {1..20}; do
        echo -e "\a"
        sleep 0.05
    done
fi

# 通知を表示（macOS）
if [[ "$OSTYPE" == "darwin"* ]]; then
    osascript -e "display notification \"$MESSAGE\" with title \"テスト完了\"" 2>/dev/null || true
fi

echo "✅ テスト完了音を鳴らしました"
