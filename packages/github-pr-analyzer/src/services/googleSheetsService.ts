import { google } from 'googleapis';
import { GitHubPullRequest } from '../types/github';

export interface GoogleSheetsConfig {
  credentials: any;
  spreadsheetId: string;
}

export class GoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;

  constructor(config: GoogleSheetsConfig) {
    const auth = new google.auth.GoogleAuth({
      credentials: config.credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
    this.spreadsheetId = config.spreadsheetId;
  }

  /**
   * スプレッドシートの最終行にプルリクエストデータを追加
   */
  async appendPullRequestData(
    pullRequests: GitHubPullRequest[],
    sheetName: string = 'Sheet1'
  ): Promise<void> {
    try {
      // 現在のデータ範囲を取得
      const range = `A1:X1000`; // 明示的な範囲指定
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range,
      });

      const existingValues = response.data.values || [];
      const hasHeaders = existingValues.length > 0;

      // PRデータをスプレッドシート用の配列形式に変換
      const prRows = this.convertPullRequestsToRows(pullRequests);

      if (prRows.length === 0) {
        console.log('追加するPRデータがありません');
        return;
      }

      // ヘッダーが存在しない場合は追加
      let valuesToAppend = prRows;
      if (!hasHeaders) {
        const headers = this.getPullRequestHeaders();
        valuesToAppend = [headers, ...prRows];
      }

      // 最終行の後にデータを追加
      const appendRange = `A1:X1000`;
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: appendRange,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: valuesToAppend,
        },
      });

      console.log(`${prRows.length}件のPRデータをスプレッドシートに追加しました`);
    } catch (error) {
      console.error('スプレッドシートへのデータ追加でエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * 重複するPRを除外して新しいPRのみを追加
   */
  async appendNewPullRequestData(
    pullRequests: GitHubPullRequest[],
    sheetName: string = 'Sheet1'
  ): Promise<void> {
    try {
      // 既存のPR番号とリポジトリの組み合わせを取得
      const existingPRs = await this.getExistingPRNumbers(sheetName);
      
      // 新しいPRのみをフィルタリング
      const newPRs = pullRequests.filter(pr => {
        const prKey = `${pr.repository.nameWithOwner}#${pr.pr_number}`;
        return !existingPRs.has(prKey);
      });

      if (newPRs.length === 0) {
        console.log('追加する新しいPRデータがありません');
        return;
      }

      console.log(`${newPRs.length}件の新しいPRデータを追加します`);
      await this.appendPullRequestData(newPRs, sheetName);
    } catch (error) {
      console.error('新しいPRデータの追加でエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * 既存のPR番号とリポジトリの組み合わせを取得
   */
  private async getExistingPRNumbers(sheetName: string): Promise<Set<string>> {
    try {
      const range = `A1:D1000`; // PR番号(A)とリポジトリ名(D)の範囲を明示的に指定
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range,
      });

      const values = response.data.values || [];
      const existingPRs = new Set<string>();

      // ヘッダー行をスキップ
      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        if (row && row[0] && row[3]) { // PR番号とリポジトリ名が存在する場合
          const prNumber = row[0];
          const repository = row[3];
          const prKey = `${repository}#${prNumber}`;
          existingPRs.add(prKey);
        }
      }

      return existingPRs;
    } catch (error) {
      console.error('既存PRデータの取得でエラーが発生しました:', error);
      return new Set();
    }
  }

  /**
   * プルリクエストデータをスプレッドシート用の行配列に変換
   */
  private convertPullRequestsToRows(pullRequests: GitHubPullRequest[]): any[][] {
    return pullRequests.map(pr => [
      pr.pr_number,
      pr.title,
      pr.url,
      pr.repository.nameWithOwner,
      pr.author.login,
      pr.state,
      this.formatDateForSpreadsheet(pr.created_at),
      this.formatDateForSpreadsheet(pr.updated_at),
      this.formatDateForSpreadsheet(pr.merged_at || ''),
      this.formatDateForSpreadsheet(pr.closed_at || ''),
      pr.additions,
      pr.deletions,
      pr.changed_files,
      this.formatLabels(pr.labels),
      pr.milestone?.title || '',
      this.formatAssignees(pr.assignees),
      pr.comments_on_pr_total_count,
      pr.reviews_submitted_total_count,
      pr.review_threads_total_count,
      pr.time_to_merge_minutes || '',
      pr.time_to_first_approval_minutes || '',
      this.formatDateForSpreadsheet(pr.first_approval_at || ''),
      pr.first_approver || '',
      this.formatDateForSpreadsheet(pr.ready_for_review_at)
    ]);
  }

  /**
   * プルリクエストヘッダーを取得
   */
  private getPullRequestHeaders(): string[] {
    return [
      'pr_number',
      'title',
      'url',
      'repository_name',
      'author',
      'state',
      'created_at',
      'updated_at',
      'merged_at',
      'closed_at',
      'additions',
      'deletions',
      'changed_files',
      'labels',
      'milestone',
      'assignees',
      'comments_count',
      'reviews_count',
      'review_threads_count',
      'time_to_merge_minutes',
      'time_to_first_approval_minutes',
      'first_approval_at',
      'first_approver',
      'ready_for_review_at'
    ];
  }

  /**
   * ラベルをフォーマット
   */
  private formatLabels(labels: any): string {
    if (!labels) return '';
    
    // GraphQLの場合：labels.nodes配列
    if (labels.nodes && Array.isArray(labels.nodes)) {
      return labels.nodes.map((l: any) => l.name).join(';');
    }
    
    // 通常の配列の場合
    if (Array.isArray(labels)) {
      return labels.map((l: any) => l.name).join(';');
    }
    
    return '';
  }

  /**
   * アサイン者をフォーマット
   */
  private formatAssignees(assignees: any): string {
    if (!assignees) return '';
    
    // GraphQLの場合：assignees.nodes配列
    if (assignees.nodes && Array.isArray(assignees.nodes)) {
      return assignees.nodes.map((a: any) => a.login).join(';');
    }
    
    // 通常の配列の場合
    if (Array.isArray(assignees)) {
      return assignees.map((a: any) => a.login).join(';');
    }
    
    return '';
  }

  /**
   * 日付をスプレッドシート用にフォーマット（JST、YYYY-MM-DDTHH:MM:SS形式の文字列）
   */
  private formatDateForSpreadsheet(dateValue: any): string {
    if (!dateValue || dateValue === '') {
      return '';
    }
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return '';
      }
      
      // JST（UTC+9）に変換
      const jstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
      
      // YYYY-MM-DDTHH:MM:SS形式で返す（JST）
      return jstDate.toISOString().slice(0, 19);
    } catch (error) {
      return '';
    }
  }
}