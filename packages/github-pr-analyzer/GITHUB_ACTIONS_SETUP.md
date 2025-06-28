# GitHub Actions 自動スプレッドシート更新セットアップガイド

このガイドでは、GitHub ActionsでPRマージ時に自動でGoogle Spreadsheetsを更新する機能のセットアップ方法を説明します。

## 1. Google Sheets API セットアップ

### Google Cloud Console での設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成または既存のプロジェクトを選択
3. Google Sheets API を有効にする：
   - 「APIとサービス」→「ライブラリ」
   - "Google Sheets API" を検索して有効化

### サービスアカウントの作成

1. 「APIとサービス」→「認証情報」
2. 「認証情報を作成」→「サービスアカウント」
3. サービスアカウント名を入力（例：`github-actions-sheets`）
4. 作成されたサービスアカウントをクリック
5. 「キー」タブ→「キーを追加」→「新しいキーを作成」
6. JSON形式を選択してダウンロード

### Google Spreadsheet の準備

1. 新しいGoogle Spreadsheetを作成
2. スプレッドシートのURLからSpreadsheet IDを取得
   - URL例: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`
3. サービスアカウントのメールアドレスにスプレッドシートの編集権限を付与
   - スプレッドシートで「共有」→サービスアカウントのメールアドレスを追加→「編集者」権限

## 2. GitHub Repository Secrets 設定

GitHub Repositoryの「Settings」→「Secrets and variables」→「Actions」で以下を設定：

### Secrets

1. **GOOGLE_SHEETS_CREDENTIALS**
   - ダウンロードしたJSON keyファイルの内容をそのまま貼り付け
   - JSON形式のまま改行も含めて全て

2. **GOOGLE_SHEET_ID**
   - GoogleスプレッドシートのID
   - URLの`/d/`と`/edit`の間の文字列

### Variables (Repository variables)

**注意**: フェーズ2.1の最適化により、以下の環境変数は不要になりました：
- ~~REPOSITORIES~~ 
- ~~PERIOD_START_DATE~~ 
- ~~PERIOD_END_DATE~~ 

新しい実装では、マージされたプルリクエストの情報をGitHub Actionsコンテキストから自動取得するため、追加の設定は不要です。

## 3. ワークフローファイルの設置

以下のワークフローファイルが既に作成されています：

```
.github/workflows/update-spreadsheet.yml
```

このファイルは以下の場合に実行されます：
- Pull Requestがmainまたはmasterブランチにマージされた時

## 4. 動作の仕組み（最適化版）

1. **トリガー**: PRがマージされるとワークフローが実行
2. **PR情報取得**: マージされたPRの番号とリポジトリ情報をGitHub Actionsコンテキストから取得
3. **データ取得**: そのPRのデータのみをGitHub APIから取得（1回のAPI呼び出し）
4. **データ追加**: 取得したPRデータをスプレッドシートの最終行に直接追加

**パフォーマンス向上**:
- 処理時間: 数分 → 数十秒
- API呼び出し数: 大幅削減（1回のみ）
- 重複チェック不要（新しくマージされたPRのみ処理）
- レート制限リスク: 大幅軽減

## 5. 出力フォーマット

スプレッドシートには以下の24列でPRデータが追加されます：

| 列名 | 説明 |
|------|------|
| pr_number | PR番号 |
| title | PRタイトル |
| url | PR URL |
| repository_name | リポジトリ名 |
| author | 作成者 |
| state | 状態（MERGED/OPEN/CLOSED） |
| created_at | 作成日時 |
| updated_at | 更新日時 |
| merged_at | マージ日時 |
| closed_at | クローズ日時 |
| additions | 追加行数 |
| deletions | 削除行数 |
| changed_files | 変更ファイル数 |
| labels | ラベル |
| milestone | マイルストーン |
| assignees | アサイン者 |
| comments_count | コメント数 |
| reviews_count | レビュー数 |
| review_threads_count | レビュースレッド数 |
| time_to_merge_minutes | マージまでの時間（分） |
| time_to_first_approval_minutes | 最初の承認までの時間（分） |
| first_approval_at | 最初の承認日時 |
| first_approver | 最初の承認者 |
| ready_for_review_at | レビュー可能になった日時 |

**日付フォーマット**:
- 形式: `YYYY-MM-DDTHH:MM:SS` (例: `2025-06-27T14:50:14`)
- タイムゾーン: JST（日本標準時）
- Lookerでの分析に最適化
- Google Sheetsで日付型として認識

## 6. 手動実行

### コマンドラインからの手動実行

特定のPRを手動でスプレッドシートに追加：

```bash
npm run dev update-spreadsheet --pr-number 123 --repository owner/repo
```

期間を指定して全PRを追加（従来の方法）：

```bash
npm run dev update-spreadsheet --start 2025-01-01 --end 2025-12-31
```

### GitHub Actionsでの手動実行

ワークフローは手動でも実行可能です：

1. GitHub Repositoryの「Actions」タブ
2. 「Update Google Spreadsheet on PR Merge」ワークフローを選択
3. 「Run workflow」ボタンをクリック

## 7. トラブルシューティング

### よくあるエラー

1. **認証エラー**
   - Google Sheets認証情報が正しく設定されているか確認
   - サービスアカウントにスプレッドシートの編集権限があるか確認

2. **権限エラー**
   - `GITHUB_TOKEN`は自動で設定されるため追加設定不要
   - リポジトリの設定で Actions の権限が有効になっているか確認

3. **データ取得エラー**
   - `REPOSITORIES`変数が正しく設定されているか確認
   - 日付形式（YYYY-MM-DD）が正しいか確認

### ログの確認

1. GitHub Repositoryの「Actions」タブでワークフローの実行結果を確認
2. 各ステップの詳細ログでエラー内容を特定
3. 「Update Google Spreadsheet with latest PR data」ステップで具体的なエラーを確認

## 8. セキュリティ考慮事項

- Google Sheets認証情報はSecretsに保存され、ログには表示されません
- サービスアカウントには最小限の権限（Google Sheets API のみ）を付与
- スプレッドシートには必要なメンバーのみアクセス権限を付与

これでPRマージ時の自動スプレッドシート更新機能が利用可能になります。