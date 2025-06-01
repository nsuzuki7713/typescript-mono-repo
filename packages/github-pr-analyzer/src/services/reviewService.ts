import { GitHubClient } from "../clients/githubClient";
import { ReviewSummary } from "../types/github";
import { Logger } from "../utils/logger";
import { DateUtils, RateLimiter, ArrayUtils } from "../utils/helpers";

export class ReviewService {
  private client: GitHubClient;
  private rateLimiter: RateLimiter;

  constructor(client: GitHubClient) {
    this.client = client;
    this.rateLimiter = new RateLimiter(1);
  }

  async generateReviewSummary(
    username: string,
    startDate: string,
    endDate: string
  ): Promise<ReviewSummary> {
    Logger.info(`Generating review summary for user: ${username}`);
    Logger.info(`Date range: ${startDate} to ${endDate}`);

    let reviewedPrNumbers: number[] = [];
    let totalReviewActions = 0;
    let totalReviewComments = 0;

    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage) {
      await this.rateLimiter.wait();

      try {
        const response = await this.client.getUserReviews(
          username,
          100,
          cursor || undefined
        );

        if (!response.user || !response.user.pullRequestReviews) {
          Logger.warn(`No review data found for user: ${username}`);
          break;
        }

        const reviews = response.user.pullRequestReviews.nodes.filter(
          (review) => {
            // Filter reviews within the date range using submittedAt
            if (!review.submittedAt) return false;
            return DateUtils.isDateInRange(
              review.submittedAt,
              startDate,
              endDate
            );
          }
        );

        const prNumbers = reviews.map((review) => review.pullRequest.number);
        reviewedPrNumbers.push(...prNumbers);

        totalReviewActions += reviews.length;

        totalReviewComments += reviews.reduce(
          (sum, review) => sum + review.comments.totalCount,
          0
        );

        hasNextPage = response.user.pullRequestReviews.pageInfo.hasNextPage;
        cursor = response.user.pullRequestReviews.pageInfo.endCursor;

        Logger.info(
          `Processed ${reviews.length} reviews (Total actions: ${totalReviewActions})`
        );
      } catch (error) {
        Logger.error("Error fetching user reviews:", error);
        throw error;
      }
    }

    const uniquePrNumbers = ArrayUtils.uniqueBy(
      reviewedPrNumbers,
      (num) => num
    );

    const summary: ReviewSummary = {
      user: username,
      period_start: startDate,
      period_end: endDate,
      reviewed_pr_count: uniquePrNumbers.length,
      submitted_review_action_count: totalReviewActions,
      total_review_comments_given: totalReviewComments,
    };

    Logger.info(`Review summary completed:`);
    Logger.info(`- Reviewed PRs: ${summary.reviewed_pr_count}`);
    Logger.info(`- Review actions: ${summary.submitted_review_action_count}`);
    Logger.info(`- Review comments: ${summary.total_review_comments_given}`);

    return summary;
  }
}
