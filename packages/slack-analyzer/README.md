# Slack Analyzer

Slack APIを使用して、特定のチャンネルからメッセージを取得し、テキストファイルに保存するTypeScriptツールです。

## 特徴

- 🚀 Slack Web APIを使用したメッセージ取得
- ⚡ APIレート制限エラー時の自動リトライ（最大速度で取得）
- 🧵 スレッド内返信メッセージの取得
- 📅 日本時間での日時表示
- 👥 メンション自動変換（`<@U123456>` → `@山田太郎`）
- 🎯 チャンネルメンバーのみの効率的ユーザー情報取得
- 🔧 柔軟な設定オプション
- 📊 処理時間の見積もりと進捗表示

## 必要なSlack App権限

以下の権限がSlack Appに必要です：

- `channels:history` - パブリックチャンネルのメッセージ読み取り
- `groups:history` - プライベートチャンネルのメッセージ読み取り
- `im:history` - ダイレクトメッセージの読み取り
- `mpim:history` - グループダイレクトメッセージの読み取り
- `users:read` - ユーザー情報の取得（名前変換用）
- `channels:read` - チャンネルメンバー一覧の取得

## APIレート制限について

Slack APIの制限と最適化：
- `conversations.history`: 50メッセージ/リクエスト（最適化済み）
- `conversations.replies`: 50メッセージ/リクエスト（最適化済み）
- `users.info`: オンデマンド取得でrate-limit対応
- 実用的な速度とAPI効率のバランスを重視

このツールはrate-limitエラーが発生した時のみ自動的に待機・リトライし、可能な限り高速で取得します。

## インストール

```bash
# 依存関係のインストール
pnpm install

# ビルド
pnpm build
```

## 設定

`.env`ファイルを作成（`.env.example`を参考）：

```env
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
DEFAULT_CHANNEL_ID=C1234567890
EXCLUDED_USER_IDS=U1234567890,U0987654321
```

## 使用方法

### コマンドライン

```bash
# 基本的な使用方法
pnpm dev extract --channel C1234567890

# オプション付きの使用方法
pnpm dev extract \
  --channel C1234567890 \
  --limit 50 \
  --output messages.txt \
  --exclude U1111111111,U2222222222

# 設定情報の確認
pnpm dev config
```

### プログラム内での使用

```typescript
import { SlackMessageExtractor, FileExporter } from 'slack-analyzer';

const config = {
  token: 'xoxb-your-bot-token',
  channelId: 'C1234567890',
  excludedUserIds: ['U1111111111'],
  messageLimit: 100,
  outputFileName: 'messages.txt'
};

const extractor = new SlackMessageExtractor(config);
const { messages, stats } = await extractor.extractMessages();
await FileExporter.exportToFile(messages, config.outputFileName, stats);
```

## 出力形式

```
# Slack Messages Export
# Generated: 2025-06-17 15:30:25
# Total Messages: 25
# Total Replies: 8
# Processing Time: 3 minutes
# ==========================================

- [2025-06-17 09:30:25] 山田太郎: @田中さん お疲れ様です！
  - [2025-06-17 09:35:10] 鈴木花子: これはスレッドへの返信です
  - [2025-06-17 09:40:05] 田中一郎: @山田さん ありがとうございます
- [2025-06-17 10:15:30] 佐藤次郎: 新しい話題です
```

### 特徴
- **日本時間表示**: Asia/Tokyo タイムゾーンで表示
- **メンション変換**: `<@U123456>` が `@実名` または `@ユーザー名` に変換
- **スレッド構造**: インデントでスレッド返信を視覚的に表現
- **統計情報**: ヘッダーに取得件数と処理時間を記録

## コマンドオプション

### extract コマンド

| オプション | 短縮形 | 説明 | 必須 | デフォルト |
|------------|--------|------|------|------------|
| `--channel` | `-c` | SlackチャンネルID | ✅ | - |
| `--token` | `-t` | Slackボットトークン | - | 環境変数から取得 |
| `--output` | `-o` | 出力ファイル名 | - | `slack-messages.txt` |
| `--limit` | `-l` | 取得するメインメッセージ数の上限 | - | `100` |
| `--exclude` | `-e` | 除外ユーザーID（カンマ区切り） | - | なし |
| `--start-date` | - | 開始日（YYYY-MM-DD形式） | - | 全期間 |
| `--end-date` | - | 終了日（YYYY-MM-DD形式） | - | 現在まで |

### 重要な注意点

**`--limit`について**:
- **メインメッセージのみカウント**: スレッドの返信は制限数に含まれません
- **例**: `--limit 10`で10個のメインメッセージを取得し、それぞれにスレッド返信があれば全て取得されます
- **実際の出力**: 10個のメインメッセージ + すべてのスレッド返信 = 合計数十個のメッセージになる可能性があります

**使用例**:
```bash
# 5個のメインメッセージとそのスレッド返信をすべて取得
pnpm dev extract --channel C123456 --limit 5

# 結果: 5個のメイン + 20個のスレッド返信 = 計25個のメッセージ出力
```

**日付範囲指定の例**:
```bash
# 2025年6月の1週間のメッセージを取得
pnpm dev extract --channel C123456 --start-date 2025-06-10 --end-date 2025-06-17

# 6月1日以降のメッセージを取得
pnpm dev extract --channel C123456 --start-date 2025-06-01

# 6月17日までのメッセージを取得
pnpm dev extract --channel C123456 --end-date 2025-06-17

# JSON形式で期間指定
pnpm dev extract --channel C123456 --start-date 2025-06-10 --end-date 2025-06-17 --format json
```

## 開発

```bash
# 開発サーバー起動
pnpm dev

# テスト実行
pnpm test

# リント
pnpm lint

# ビルド
pnpm build
```

## セットアップガイド

### 1. Slack App作成
1. https://api.slack.com/apps でアプリを作成
2. **OAuth & Permissions** で以下の権限を追加：
   - `channels:history`, `groups:history`, `im:history`, `mpim:history`
   - `users:read`, `channels:read`
3. **Install App to Workspace** でワークスペースにインストール
4. **Bot User OAuth Token** をコピー

### 2. ボットをチャンネルに追加
- 対象チャンネルでボットを招待: `/invite @your-bot-name`
- または チャンネル設定 → インテグレーション からボットを追加

### 3. 環境変数設定
```bash
cp .env.example .env
# .env ファイルでSLACK_BOT_TOKENを設定
```

## エラーハンドリング

- 🔑 **認証エラー**: `SLACK_BOT_TOKEN`を確認
- 📡 **チャンネルが見つからない**: チャンネルIDを確認
- 🚫 **アクセス権限なし**: ボットをチャンネルに追加
- 👤 **権限不足**: `users:read`, `channels:read`権限を追加
- ⏱️ **レート制限**: 自動リトライで対応
- 🌐 **ネットワークエラー**: 接続環境を確認

## ライセンス

MIT