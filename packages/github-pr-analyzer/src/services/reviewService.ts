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
        const response: any = await this.client.getUserReviews(
          username,
          startDate,
          endDate,
          100,
          cursor || undefined
        );

        if (!response.search || !response.search.edges) {
          Logger.warn(`No review data found for user: ${username}`);
          break;
        }

        let reviewsInPeriod = 0;
        let commentsInPeriod = 0;

        // Process pull requests and extract reviews by the specific user
        for (const edge of response.search.edges) {
          const pr = edge.node;
          if (pr.reviews && pr.reviews.nodes) {
            const userReviews = pr.reviews.nodes.filter(
              (review: any) =>
                review.author &&
                review.author.login === username &&
                review.submittedAt &&
                DateUtils.isDateInRange(review.submittedAt, startDate, endDate)
            );

            if (userReviews.length > 0) {
              reviewedPrNumbers.push(pr.number);
              reviewsInPeriod += userReviews.length;
              commentsInPeriod += userReviews.reduce(
                (sum: number, review: any) => sum + review.comments.totalCount,
                0
              );
            }
          }
        }

        totalReviewActions += reviewsInPeriod;
        totalReviewComments += commentsInPeriod;

        hasNextPage = response.search.pageInfo.hasNextPage;
        cursor = response.search.pageInfo.endCursor;

        Logger.info(
          `Processed ${reviewsInPeriod} reviews (Total actions: ${totalReviewActions})`
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
