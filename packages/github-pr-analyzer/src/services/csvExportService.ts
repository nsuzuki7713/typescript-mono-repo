import { GitHubPullRequest, ReviewSummary } from '../types/github';
import { FileManager } from '../utils/fileManager';

export interface CSVExportOptions {
  outputDir: string;
  filename?: string;
  includeHeaders?: boolean;
}

export class CSVExportService {
  constructor() {}

  /**
   * プルリクエストデータをCSV形式で出力
   */
  async exportPullRequestsToCSV(
    pullRequests: GitHubPullRequest[],
    options: CSVExportOptions
  ): Promise<string> {
    const headers = [
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

    const csvData = pullRequests.map(pr => [
      this.formatCsvValue(pr.pr_number),
      this.formatCsvValue(pr.title),
      this.formatCsvValue(pr.url),
      this.formatCsvValue(pr.repository.nameWithOwner),
      this.formatCsvValue(pr.author.login),
      this.formatCsvValue(pr.state),
      this.formatDateForLooker(pr.created_at),
      this.formatDateForLooker(pr.updated_at),
      this.formatDateForLooker(pr.merged_at || ''),
      this.formatDateForLooker(pr.closed_at || ''),
      this.formatCsvValue(pr.additions),
      this.formatCsvValue(pr.deletions),
      this.formatCsvValue(pr.changed_files),
      this.formatCsvValue(pr.labels.map(l => l.name).join(';')),
      this.formatCsvValue(pr.milestone?.title || ''),
      this.formatCsvValue(pr.assignees.map(a => a.login).join(';')),
      this.formatCsvValue(pr.comments_on_pr_total_count),
      this.formatCsvValue(pr.reviews_submitted_total_count),
      this.formatCsvValue(pr.review_threads_total_count),
      this.formatCsvValue(pr.time_to_merge_minutes || ''),
      this.formatCsvValue(pr.time_to_first_approval_minutes || ''),
      this.formatDateForLooker(pr.first_approval_at || ''),
      this.formatCsvValue(pr.first_approver || ''),
      this.formatDateForLooker(pr.ready_for_review_at)
    ]);

    let csvContent = '';
    if (options.includeHeaders !== false) {
      csvContent += headers.join(',') + '\n';
    }
    csvContent += csvData.map(row => row.join(',')).join('\n');

    const filename = options.filename || this.generatePRFilename();
    const filePath = await FileManager.writeTextFile(
      options.outputDir,
      filename,
      csvContent
    );

    return filePath;
  }

  /**
   * レビューサマリーデータをCSV形式で出力
   */
  async exportReviewSummaryToCSV(
    reviewSummaries: ReviewSummary[],
    options: CSVExportOptions
  ): Promise<string> {
    const headers = [
      'user',
      'period_start',
      'period_end',
      'reviewed_pr_count',
      'submitted_review_action_count',
      'total_review_comments_given'
    ];

    const csvData = reviewSummaries.map(summary => [
      this.formatCsvValue(summary.user),
      this.formatCsvValue(summary.period_start),
      this.formatCsvValue(summary.period_end),
      this.formatCsvValue(summary.reviewed_pr_count),
      this.formatCsvValue(summary.submitted_review_action_count),
      this.formatCsvValue(summary.total_review_comments_given)
    ]);

    let csvContent = '';
    if (options.includeHeaders !== false) {
      csvContent += headers.join(',') + '\n';
    }
    csvContent += csvData.map(row => row.join(',')).join('\n');

    const filename = options.filename || this.generateReviewFilename();
    const filePath = await FileManager.writeTextFile(
      options.outputDir,
      filename,
      csvContent
    );

    return filePath;
  }

  /**
   * 全ユーザーのプルリクエストデータをCSV形式で出力
   */
  async exportAllUsersPullRequestsToCSV(
    pullRequests: GitHubPullRequest[],
    options: CSVExportOptions
  ): Promise<string> {
    const headers = [
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

    const csvData = pullRequests.map(pr => [
      this.formatCsvValue(pr.pr_number),
      this.formatCsvValue(pr.title),
      this.formatCsvValue(pr.url),
      this.formatCsvValue(pr.repository.nameWithOwner),
      this.formatCsvValue(pr.author.login),
      this.formatCsvValue(pr.state),
      this.formatDateForLooker(pr.created_at),
      this.formatDateForLooker(pr.updated_at),
      this.formatDateForLooker(pr.merged_at || ''),
      this.formatDateForLooker(pr.closed_at || ''),
      this.formatCsvValue(pr.additions),
      this.formatCsvValue(pr.deletions),
      this.formatCsvValue(pr.changed_files),
      this.formatCsvValue(pr.labels.map(l => l.name).join(';')),
      this.formatCsvValue(pr.milestone?.title || ''),
      this.formatCsvValue(pr.assignees.map(a => a.login).join(';')),
      this.formatCsvValue(pr.comments_on_pr_total_count),
      this.formatCsvValue(pr.reviews_submitted_total_count),
      this.formatCsvValue(pr.review_threads_total_count),
      this.formatCsvValue(pr.time_to_merge_minutes || ''),
      this.formatCsvValue(pr.time_to_first_approval_minutes || ''),
      this.formatDateForLooker(pr.first_approval_at || ''),
      this.formatCsvValue(pr.first_approver || ''),
      this.formatDateForLooker(pr.ready_for_review_at)
    ]);

    let csvContent = '';
    if (options.includeHeaders !== false) {
      csvContent += headers.join(',') + '\n';
    }
    csvContent += csvData.map(row => row.join(',')).join('\n');

    const filename = options.filename || this.generateAllUsersFilename();
    const filePath = await FileManager.writeTextFile(
      options.outputDir,
      filename,
      csvContent
    );

    return filePath;
  }

  /**
   * チーム分析用の統合CSVを出力（プルリクエスト + レビューサマリー）
   */
  async exportCombinedToCSV(
    pullRequests: GitHubPullRequest[],
    options: CSVExportOptions,
    reviewSummary?: ReviewSummary
  ): Promise<string> {
    const headers = [
      'pr_number',
      'title',
      'url',
      'repository_name',
      'author',
      'state',
      'created_at',
      'merged_at',
      'additions',
      'deletions',
      'changed_files',
      'time_to_merge_minutes',
      'time_to_first_approval_minutes',
      'comments_count',
      'reviews_count',
      'labels',
      'assignees'
    ];

    if (reviewSummary) {
      headers.push(
        'reviewer_user',
        'reviewer_pr_count',
        'reviewer_action_count',
        'reviewer_comments_given'
      );
    }

    const csvData = pullRequests.map(pr => {
      const baseRow = [
        this.formatCsvValue(pr.pr_number),
        this.formatCsvValue(pr.title),
        this.formatCsvValue(pr.url),
        this.formatCsvValue(pr.repository.nameWithOwner),
        this.formatCsvValue(pr.author.login),
        this.formatCsvValue(pr.state),
        this.formatDateForLooker(pr.created_at),
        this.formatDateForLooker(pr.merged_at || ''),
        this.formatCsvValue(pr.additions),
        this.formatCsvValue(pr.deletions),
        this.formatCsvValue(pr.changed_files),
        this.formatCsvValue(pr.time_to_merge_minutes || ''),
        this.formatCsvValue(pr.time_to_first_approval_minutes || ''),
        this.formatCsvValue(pr.comments_on_pr_total_count),
        this.formatCsvValue(pr.reviews_submitted_total_count),
        this.formatCsvValue(pr.labels.map(l => l.name).join(';')),
        this.formatCsvValue(pr.assignees.map(a => a.login).join(';'))
      ];

      if (reviewSummary) {
        baseRow.push(
          this.formatCsvValue(reviewSummary.user),
          this.formatCsvValue(reviewSummary.reviewed_pr_count),
          this.formatCsvValue(reviewSummary.submitted_review_action_count),
          this.formatCsvValue(reviewSummary.total_review_comments_given)
        );
      }

      return baseRow;
    });

    let csvContent = '';
    if (options.includeHeaders !== false) {
      csvContent += headers.join(',') + '\n';
    }
    csvContent += csvData.map(row => row.join(',')).join('\n');

    const filename = options.filename || this.generateCombinedFilename();
    const filePath = await FileManager.writeTextFile(
      options.outputDir,
      filename,
      csvContent
    );

    return filePath;
  }

  /**
   * CSV値のエスケープ処理（すべてのテキストフィールドを常にダブルクォートで囲む）
   */
  private escapeCsvValue(value: string): string {
    // 空文字列の場合はそのまま返す
    if (value === '') {
      return value;
    }
    // すべてのテキストをダブルクォートで囲み、内部のダブルクォートはエスケープ
    return `"${value.replace(/"/g, '""')}"`;
  }

  /**
   * 数値やboolean値はそのまま返す（クォートなし）
   */
  private formatCsvValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return this.escapeCsvValue(String(value));
  }

  /**
   * 日付フィールド用のフォーマット（Looker用 YYYY-MM-DD HH:MM:SS形式）
   */
  private formatDateForLooker(dateValue: any): string {
    if (!dateValue || dateValue === '') {
      return '';
    }
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return this.formatCsvValue(dateValue); // 無効な日付の場合は通常のフォーマットで
      }
      
      // YYYY-MM-DD HH:MM:SS形式で出力
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      const formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      return this.escapeCsvValue(formatted);
    } catch (error) {
      return this.formatCsvValue(dateValue); // エラーの場合は通常のフォーマットで
    }
  }

  /**
   * PRファイル名の生成
   */
  private generatePRFilename(): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    return `pull_requests_${timestamp}.csv`;
  }

  /**
   * レビューファイル名の生成
   */
  private generateReviewFilename(): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    return `review_summary_${timestamp}.csv`;
  }

  /**
   * 統合ファイル名の生成
   */
  private generateCombinedFilename(): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    return `combined_analysis_${timestamp}.csv`;
  }

  /**
   * 全ユーザーファイル名の生成
   */
  private generateAllUsersFilename(): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    return `all_users_pull_requests_${timestamp}.csv`;
  }
}