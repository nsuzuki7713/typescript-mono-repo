import {
  GitHubPullRequest,
  RepositorySummary,
  RepositoryActivity,
  RepositoryOverallStats,
} from "../types/github";
import { ReviewSummary } from "../types/github";
import { GitHubClient } from "../clients/githubClient";
import { Logger } from "../utils/logger";

/**
 * リポジトリサマリー生成サービス
 * 各リポジトリごとの活動統計を集計
 */
export class RepositoryService {
  constructor(private githubClient: GitHubClient) {}

  /**
   * プルリクエストデータとレビューサマリーからリポジトリサマリーを生成
   */
  async generateRepositorySummary(
    pullRequests: GitHubPullRequest[],
    reviewSummary: ReviewSummary,
    user: string,
    periodStart: string,
    periodEnd: string
  ): Promise<RepositorySummary> {
    Logger.info(`Generating repository summary for user: ${user}`);
    Logger.info(
      `Analyzing ${pullRequests.length} pull requests across repositories`
    );

    // リポジトリごとのPR活動を集計
    const repositoryMap = new Map<string, RepositoryActivity>();

    // 作成したPRから統計を計算
    for (const pr of pullRequests) {
      const repoName = pr.repository.nameWithOwner;

      if (!repositoryMap.has(repoName)) {
        repositoryMap.set(repoName, {
          repository_name: repoName,
          created_prs_count: 0,
          merged_prs_count: 0,
          total_additions: 0,
          total_deletions: 0,
          total_comments_received: 0,
          total_review_comments_received: 0,
          reviewed_prs_count: 0,
          review_actions_count: 0,
          review_comments_given: 0,
          first_pr_created_at: null,
          last_pr_created_at: null,
          repository_overall_stats: {
            total_prs_in_period: 0,
            total_merged_prs_in_period: 0,
            total_open_prs_in_period: 0,
            total_closed_prs_in_period: 0,
            user_contribution_rate: 0,
            first_pr_in_period: null,
            last_pr_in_period: null,
          },
        });
      }

      const activity = repositoryMap.get(repoName)!;

      // PR作成統計を更新
      activity.created_prs_count++;
      if (pr.state === "MERGED") {
        activity.merged_prs_count++;
      }
      activity.total_additions += pr.additions;
      activity.total_deletions += pr.deletions;
      activity.total_comments_received += pr.comments_on_pr_total_count;
      activity.total_review_comments_received += pr.review_threads_total_count;

      // 日付の更新
      const createdAt = pr.created_at;
      if (
        !activity.first_pr_created_at ||
        createdAt < activity.first_pr_created_at
      ) {
        activity.first_pr_created_at = createdAt;
      }
      if (
        !activity.last_pr_created_at ||
        createdAt > activity.last_pr_created_at
      ) {
        activity.last_pr_created_at = createdAt;
      }
    }

    // 各リポジトリの全体統計を取得
    for (const [repoName, activity] of repositoryMap) {
      Logger.info(`Fetching overall stats for repository: ${repoName}`);
      
      try {
        const repoStats = await this.githubClient.getRepositoryPullRequestStats(
          repoName,
          periodStart,
          periodEnd
        );

        activity.repository_overall_stats = {
          total_prs_in_period: repoStats.total,
          total_merged_prs_in_period: repoStats.merged,
          total_open_prs_in_period: repoStats.open,
          total_closed_prs_in_period: repoStats.closed,
          user_contribution_rate: repoStats.total > 0 
            ? Math.round((activity.created_prs_count / repoStats.total) * 100 * 100) / 100 
            : 0,
          first_pr_in_period: repoStats.firstPrDate,
          last_pr_in_period: repoStats.lastPrDate,
        };
      } catch (error) {
        Logger.error(`Failed to fetch stats for ${repoName}: ${error}`);
        // エラーの場合はデフォルト値を保持
      }
    }

    // レビュー活動の統計はレビューサマリーから全体として取得
    // 個別リポジトリごとのレビュー統計は現在のAPIでは取得困難なため、
    // 将来的に詳細なレビューデータが必要な場合は別途実装を検討

    const repositories = Array.from(repositoryMap.values()).sort(
      (a, b) => b.created_prs_count - a.created_prs_count
    );

    const summary: RepositorySummary = {
      user,
      period_start: periodStart,
      period_end: periodEnd,
      repositories,
    };

    Logger.info(`Repository summary completed:`);
    Logger.info(`- Repositories analyzed: ${repositories.length}`);
    Logger.info(
      `- Most active repository: ${
        repositories[0]?.repository_name || "None"
      } (${repositories[0]?.created_prs_count || 0} PRs)`
    );

    return summary;
  }

  /**
   * リポジトリサマリーの統計情報をログ出力
   */
  logRepositorySummary(summary: RepositorySummary): void {
    Logger.info("Repository breakdown:");
    summary.repositories.forEach((repo, index) => {
      const stats = repo.repository_overall_stats;
      Logger.info(`  ${index + 1}. ${repo.repository_name}:`);
      Logger.info(
        `     - Your PRs: ${repo.created_prs_count} (merged: ${repo.merged_prs_count})`
      );
      Logger.info(
        `     - Repository total PRs: ${stats.total_prs_in_period} (merged: ${stats.total_merged_prs_in_period}, open: ${stats.total_open_prs_in_period})`
      );
      Logger.info(
        `     - Your contribution rate: ${stats.user_contribution_rate}%`
      );
      Logger.info(
        `     - Your code changes: +${repo.total_additions}/-${repo.total_deletions}`
      );
      Logger.info(
        `     - Comments received: ${repo.total_comments_received} (reviews: ${repo.total_review_comments_received})`
      );
    });
  }
}
