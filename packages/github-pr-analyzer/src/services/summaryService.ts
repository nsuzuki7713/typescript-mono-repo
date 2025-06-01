import { GitHubPullRequest, OverallSummary } from "../types/github";
import { Logger } from "../utils/logger";

export class SummaryService {
  generateOverallSummary(
    username: string,
    startDate: string,
    endDate: string,
    pullRequests: GitHubPullRequest[]
  ): OverallSummary {
    Logger.info(`Generating overall summary for user: ${username}`);
    Logger.info(`Analyzing ${pullRequests.length} pull requests`);

    const filteredPRs = pullRequests.filter((pr) => {
      const createdAt = new Date(pr.created_at);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      return createdAt >= start && createdAt <= end;
    });

    const totalCreatedPrs = filteredPRs.length;
    const totalMergedPrs = filteredPRs.filter(
      (pr) => pr.state === "MERGED"
    ).length;

    const totalAdditions = filteredPRs.reduce(
      (sum, pr) => sum + pr.additions,
      0
    );
    const totalDeletions = filteredPRs.reduce(
      (sum, pr) => sum + pr.deletions,
      0
    );

    const totalPrBodyComments = filteredPRs.reduce(
      (sum, pr) => sum + pr.comments_on_pr_total_count,
      0
    );

    const totalReviewComments = filteredPRs.reduce(
      (sum, pr) => sum + pr.review_threads_total_count,
      0
    );

    const summary: OverallSummary = {
      user: username,
      period_start: startDate,
      period_end: endDate,
      total_created_prs: totalCreatedPrs,
      total_merged_prs: totalMergedPrs,
      total_additions_in_created_prs: totalAdditions,
      total_deletions_in_created_prs: totalDeletions,
      total_pr_body_comments_received: totalPrBodyComments,
      total_review_comments_received_on_created_prs: totalReviewComments,
    };

    Logger.info(`Overall summary completed:`);
    Logger.info(`- Total PRs created: ${summary.total_created_prs}`);
    Logger.info(`- Total PRs merged: ${summary.total_merged_prs}`);

    return summary;
  }
}
