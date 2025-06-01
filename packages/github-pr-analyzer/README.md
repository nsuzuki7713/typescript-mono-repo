# GitHub PR Analyzer

エンジニアの自己評価プロセスにおいて、GitHub のプルリクエスト（PR）情報を収集・分析するコマンドラインツールです。

## 機能

1. **プルリクエスト詳細情報の収集**: 指定期間内に作成した PR の詳細情報を JSON ファイルに出力
2. **レビュー活動サマリーの集計**: 指定期間内のレビュー活動に関するサマリー情報を JSON ファイルに出力
3. **全体サマリーの生成**: プルリクエストデータから活動全体のサマリー情報を集計

## セットアップ

### 1. 依存関係のインストール

```bash
cd packages/github-pr-analyzer
npm install
```

### 2. 設定ファイルの作成

```bash
cp .env.example .env
```

`.env`ファイルを編集して、必要な設定値を入力してください：

```env
# GitHub Personal Access Token（必須）
GITHUB_TOKEN=your_github_token_here

# 分析対象のGitHubユーザー名（必須）
GITHUB_USER_LOGIN=your_github_username

# データ収集期間（必須、YYYY-MM-DD形式）
PERIOD_START_DATE=2024-01-01
PERIOD_END_DATE=2024-12-31

# 分析対象リポジトリ（オプション、カンマ区切り）
REPOSITORIES=owner1/repo1,owner2/repo2

# 出力ディレクトリ（オプション、デフォルト: ./output）
OUTPUT_DIR=./output
```

### 3. GitHub Personal Access Token の取得

1. GitHub 設定画面にアクセス: https://github.com/settings/tokens
2. "Generate new token (classic)"をクリック
3. 必要なスコープを選択: `repo`, `read:user`
4. 生成されたトークンを`.env`ファイルの`GITHUB_TOKEN`に設定

### 4. ビルド

```bash
npm run build
```

## 使用方法

### 全ての分析を実行

```bash
npm run dev analyze
# または
npm start analyze
```

### 個別コマンドの実行

#### プルリクエスト詳細のみ収集

```bash
npm run dev pull-requests
```

#### レビューサマリーのみ収集

```bash
npm run dev reviews
```

#### 全体サマリーのみ生成

```bash
npm run dev summary path/to/pr-details-file.json
```

#### 現在の設定を確認

```bash
npm run dev config
```

## 出力ファイル

すべてのファイルは `./output/` ディレクトリに生成されます。

### 1. プルリクエスト詳細 (`created_prs_details_[ユーザー名]_[期間].json`)

ユーザーが作成したプルリクエストの詳細情報（配列形式）：

```json
[
  {
    "pr_number": 127,                          // PR番号
    "title": "feat: 新しい機能を追加",           // PRタイトル
    "body": "詳細な説明...",                    // PR本文
    "url": "https://github.com/owner/repo/pull/127", // PR URL
    "repository": {                            // リポジトリ情報
      "nameWithOwner": "owner/repo",
      "owner": { "login": "owner" },
      "name": "repo"
    },
    "author": { "login": "username" },         // 作成者
    "state": "MERGED",                         // 状態: "OPEN" | "MERGED" | "CLOSED"
    "created_at": "2025-05-31T08:47:08Z",     // 作成日時（ISO 8601）
    "updated_at": "2025-05-31T16:29:52Z",     // 更新日時（ISO 8601）
    "merged_at": "2025-05-31T16:30:00Z",      // マージ日時（null可）
    "closed_at": "2025-05-31T16:30:00Z",      // クローズ日時（null可）
    "additions": 156,                          // 追加行数
    "deletions": 7,                           // 削除行数
    "changed_files": 3,                       // 変更ファイル数
    "labels": [                               // ラベル一覧
      { "name": "enhancement", "color": "a2eeef" }
    ],
    "milestone": {                            // マイルストーン（null可）
      "title": "v1.0.0",
      "due_on": "2025-06-30T00:00:00Z"
    },
    "assignees": [                            // アサイン者一覧
      { "login": "username" }
    ],
    "comments_on_pr_total_count": 5,          // PR本体のコメント数
    "reviews_submitted_total_count": 2,       // 提出されたレビュー数
    "review_threads_total_count": 3,          // レビュースレッド数
    "time_to_merge_hours": 7.75              // マージまでの時間（null可）
  }
]
```

### 2. レビューサマリー (`my_review_summary_[ユーザー名]_[期間].json`)

ユーザーが行ったレビュー活動の統計情報：

```json
{
  "user": "username",                        // 対象ユーザー名
  "period_start": "2025-01-01",             // 分析期間開始日
  "period_end": "2025-06-01",               // 分析期間終了日
  "reviewed_pr_count": 50,                  // レビューしたPR数（重複除去）
  "submitted_review_action_count": 91,      // レビューアクション総数（承認、変更要求、コメント等）
  "total_review_comments_given": 79         // レビューコメント総数
}
```

### 3. 全体サマリー (`overall_summary_[ユーザー名]_[期間].json`)

ユーザーのプルリクエスト作成活動の統計情報：

```json
{
  "user": "username",                               // 対象ユーザー名
  "period_start": "2025-01-01",                    // 分析期間開始日
  "period_end": "2025-06-01",                      // 分析期間終了日
  "total_created_prs": 30,                         // 作成したPR総数
  "total_merged_prs": 28,                          // マージされたPR総数
  "total_additions_in_created_prs": 1234,          // 追加行数合計
  "total_deletions_in_created_prs": 567,           // 削除行数合計
  "total_pr_body_comments_received": 45,           // 受け取ったPRコメント総数
  "total_review_comments_received_on_created_prs": 123 // 受け取ったレビューコメント総数
}
```

## プロジェクト構成

```
packages/github-pr-analyzer/
├── src/
│   ├── clients/           # APIクライアント
│   │   ├── github.ts      # 基本GitHubクライアント
│   │   └── githubClient.ts # GraphQL対応GitHubクライアント
│   ├── config/            # 設定管理
│   │   ├── config.ts      # 設定マネージャー
│   │   └── index.ts       # 設定のエクスポート
│   ├── graphql/           # GraphQLクエリ
│   │   ├── pullRequests.ts # PRクエリ
│   │   └── reviews.ts     # レビュークエリ
│   ├── services/          # ビジネスロジック
│   │   ├── analyzerController.ts # メインコントローラー
│   │   ├── pullRequestService.ts # PR収集サービス
│   │   ├── reviewService.ts      # レビュー分析サービス
│   │   └── summaryService.ts     # サマリー生成サービス
│   ├── types/             # 型定義
│   │   ├── common.ts      # 共通型
│   │   ├── github.ts      # GitHub API型
│   │   └── index.ts       # 型のエクスポート
│   ├── utils/             # ユーティリティ
│   │   ├── fileManager.ts # ファイル操作
│   │   ├── helpers.ts     # ヘルパー関数
│   │   ├── logger.ts      # ログ機能
│   │   └── index.ts       # ユーティリティのエクスポート
│   └── main.ts            # エントリーポイント
├── output/                # 生成ファイル出力先
├── .env.example           # 設定ファイルサンプル
├── jest.config.js         # テスト設定
├── package.json
├── tsconfig.json
└── README.md
```

## 開発

### テストの実行

```bash
npm test
```

### リンターの実行

```bash
npm run lint
npm run lint:fix
```

## 注意事項

- GitHub API のレート制限に注意してください（認証済みで 5,000 リクエスト/時間）
- 大量のデータを扱う場合は実行時間が長くなる可能性があります
- Personal Access Token は適切に管理し、公開リポジトリにコミットしないよう注意してください

## トラブルシューティング

### よくある問題

1. **認証エラー**: GitHub Token が正しく設定されているか確認
2. **レート制限エラー**: しばらく待ってから再実行
3. **設定エラー**: `.env`ファイルの設定値を確認

### ログの確認

ツールは詳細なログを出力します。エラーが発生した場合は、ログメッセージを確認してください。

## ライセンス

MIT
