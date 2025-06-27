import { GitHubClient } from "../clients/githubClient";
import { GitHubPullRequest, GraphQLPullRequest } from "../types/github";
import { Logger, ProgressTracker } from "../utils/logger";
import { DateUtils, RateLimiter } from "../utils/helpers";

export class PullRequestService {
  private client: GitHubClient;
  private rateLimiter: RateLimiter;

  constructor(client: GitHubClient) {
    this.client = client;
    this.rateLimiter = new RateLimiter(1); // 1 request per second to avoid rate limiting
  }

  /**
   * Fetch all pull requests created by a user within the specified date range
   */
  async fetchUserPullRequests(
    username: string,
    startDate: string,
    endDate: string,
    repositories?: string[]
  ): Promise<GitHubPullRequest[]> {
    Logger.info(`Fetching pull requests for user: ${username}`);
    Logger.info(`Date range: ${startDate} to ${endDate}`);

    const query = this.client.buildPRSearchQuery(
      username,
      startDate,
      endDate,
      repositories
    );
    Logger.info(`Search query: ${query}`);

    const allPullRequests: GitHubPullRequest[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage) {
      await this.rateLimiter.wait();

      try {
        const response: any = await this.client.searchPullRequests(
          query,
          100,
          cursor || undefined
        );

        const pullRequests = response.search.edges
          .map((edge: any) => edge.node)
          .filter((pr: any) => this.isValidPullRequest(pr, startDate, endDate))
          .map((pr: any) => this.transformPullRequest(pr));

        allPullRequests.push(...pullRequests);

        hasNextPage = response.search.pageInfo.hasNextPage;
        cursor = response.search.pageInfo.endCursor;

        Logger.info(
          `Fetched ${pullRequests.length} PRs (Total: ${allPullRequests.length})`
        );
      } catch (error) {
        Logger.error("Error fetching pull requests:", error);
        throw error;
      }
    }

    Logger.info(`Total pull requests fetched: ${allPullRequests.length}`);
    return allPullRequests;
  }

  /**
   * Fetch all pull requests within the specified date range (all users)
   */
  async fetchAllPullRequests(
    startDate: string,
    endDate: string,
    repositories?: string[]
  ): Promise<GitHubPullRequest[]> {
    Logger.info(`Fetching all pull requests in repositories`);
    Logger.info(`Date range: ${startDate} to ${endDate}`);

    const query = this.client.buildAllPRSearchQuery(
      startDate,
      endDate,
      repositories
    );
    Logger.info(`Search query: ${query}`);

    const allPullRequests: GitHubPullRequest[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage) {
      await this.rateLimiter.wait();

      try {
        const response: any = await this.client.searchPullRequests(
          query,
          100,
          cursor || undefined
        );

        const pullRequests = response.search.edges
          .map((edge: any) => edge.node)
          .filter((pr: GraphQLPullRequest) =>
            this.isValidPullRequest(pr, startDate, endDate)
          )
          .map((pr: GraphQLPullRequest) => this.transformPullRequest(pr));

        allPullRequests.push(...pullRequests);

        hasNextPage = response.search.pageInfo.hasNextPage;
        cursor = response.search.pageInfo.endCursor;

        Logger.info(
          `Fetched ${pullRequests.length} PRs (Total: ${allPullRequests.length})`
        );
      } catch (error) {
        Logger.error(`Failed to fetch pull requests: ${error}`);
        throw error;
      }
    }

    Logger.info(`Total pull requests fetched: ${allPullRequests.length}`);
    return allPullRequests;
  }

  /**
   * Validate if pull request is within the date range and has required data
   */
  private isValidPullRequest(
    pr: GraphQLPullRequest,
    startDate: string,
    endDate: string
  ): boolean {
    // Check if the PR was created within the date range
    if (!DateUtils.isDateInRange(pr.createdAt, startDate, endDate)) {
      return false;
    }

    // Ensure required fields are present
    if (!pr.author || !pr.repository) {
      Logger.warn(
        `Skipping PR ${pr.number} due to missing author or repository data`
      );
      return false;
    }

    return true;
  }

  /**
   * Transform GraphQL pull request to our internal format
   */
  private transformPullRequest(pr: GraphQLPullRequest): GitHubPullRequest {
    const timeToMerge = pr.mergedAt
      ? this.client.calculateTimeToMerge(pr.createdAt, pr.mergedAt)
      : null;

    const firstApprovalInfo = this.getFirstApprovalInfo(pr);
    const readyForReviewAt = this.getReadyForReviewTime(pr);

    return {
      pr_number: pr.number,
      title: pr.title,
      body: pr.body || "",
      url: pr.url,
      repository: {
        nameWithOwner: pr.repository.nameWithOwner,
        owner: { login: pr.repository.owner.login },
        name: pr.repository.name,
      },
      author: { login: pr.author.login },
      state: this.normalizeState(pr.state),
      created_at: pr.createdAt,
      updated_at: pr.updatedAt,
      merged_at: pr.mergedAt,
      closed_at: pr.closedAt,
      additions: pr.additions,
      deletions: pr.deletions,
      changed_files: pr.changedFiles,
      labels: pr.labels.nodes.map((label) => ({
        name: label.name,
        color: label.color,
      })),
      milestone: pr.milestone
        ? {
            title: pr.milestone.title,
            due_on: pr.milestone.dueOn,
          }
        : null,
      assignees: pr.assignees.nodes.map((assignee) => ({
        login: assignee.login,
      })),
      comments_on_pr_total_count: pr.comments.totalCount,
      reviews_submitted_total_count: pr.reviews.totalCount,
      review_threads_total_count: pr.reviewThreads.totalCount,
      time_to_merge_minutes: timeToMerge,
      time_to_first_approval_minutes: firstApprovalInfo.timeToFirstApproval,
      first_approval_at: firstApprovalInfo.firstApprovalAt,
      first_approver: firstApprovalInfo.firstApprover,
      ready_for_review_at: readyForReviewAt,
    };
  }

  /**
   * Normalize pull request state
   */
  private normalizeState(state: string): "MERGED" | "CLOSED" | "OPEN" {
    switch (state.toUpperCase()) {
      case "MERGED":
        return "MERGED";
      case "CLOSED":
        return "CLOSED";
      case "OPEN":
        return "OPEN";
      default:
        Logger.warn(`Unknown PR state: ${state}, defaulting to OPEN`);
        return "OPEN";
    }
  }

  /**
   * Calculate time to first approval in hours
   */
  private getFirstApprovalInfo(pr: GraphQLPullRequest): {
    timeToFirstApproval: number | null;
    firstApprovalAt: string | null;
    firstApprover: string | null;
  } {
    if (!pr.reviews || pr.reviews.nodes.length === 0) {
      return { timeToFirstApproval: null, firstApprovalAt: null, firstApprover: null };
    }

    const approvalReviews = pr.reviews.nodes
      .filter((review) => review.state === 'APPROVED')
      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

    const firstApproval = approvalReviews[0];

    if (!firstApproval) {
      return { timeToFirstApproval: null, firstApprovalAt: null, firstApprover: null };
    }

    const readyForReviewEvents = pr.timelineItems.nodes || [];
    const lastReadyForReviewEvent = readyForReviewEvents.length > 0 ? readyForReviewEvents[readyForReviewEvents.length - 1] : null;

    const lastReadyForReviewTime = lastReadyForReviewEvent
      ? new Date(lastReadyForReviewEvent.createdAt).getTime()
      : new Date(pr.createdAt).getTime();

    const firstApprovalTime = new Date(firstApproval.submittedAt).getTime();
    const timeToFirstApproval = (firstApprovalTime - lastReadyForReviewTime) / (1000 * 60);

    return {
      timeToFirstApproval,
      firstApprovalAt: firstApproval.submittedAt,
      firstApprover: firstApproval.author.login,
    };
  }

  /**
   * Get the time when PR became ready for review (last time it was converted from draft to open)
   */
  private getReadyForReviewTime(pr: GraphQLPullRequest): string {
    const readyForReviewEvents = pr.timelineItems.nodes || [];
    
    if (readyForReviewEvents.length > 0) {
      // Get the last ready for review event (in case the PR was converted back to draft and then back to ready)
      const lastReadyForReviewEvent = readyForReviewEvents[readyForReviewEvents.length - 1];
      return lastReadyForReviewEvent?.createdAt || pr.createdAt;
    }
    
    // If no ready for review events found, assume it was ready from creation
    return pr.createdAt;
  }
}
