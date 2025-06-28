import { graphql } from "@octokit/graphql";
import { GraphQLSearchResponse, GraphQLReviewResponse } from "../types/github";
import { SEARCH_PULL_REQUESTS_QUERY } from "../graphql/pullRequests";
import { GET_USER_REVIEWS_QUERY } from "../graphql/reviews";
import { GET_SINGLE_PULL_REQUEST_QUERY } from "../graphql/singlePullRequest";

export class GitHubClient {
  private graphqlWithAuth: typeof graphql;

  constructor(token: string) {
    this.graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${token}`,
      },
    });
  }

  async searchPullRequests(
    searchQuery: string,
    first: number = 100,
    after?: string
  ): Promise<GraphQLSearchResponse> {
    try {
      const response = await this.graphqlWithAuth(SEARCH_PULL_REQUESTS_QUERY, {
        searchQuery,
        first,
        after,
      });
      return response as GraphQLSearchResponse;
    } catch (error) {
      console.error("Error searching pull requests:", error);
      throw new Error(`Failed to search pull requests: ${error}`);
    }
  }

  async getUserReviews(
    login: string,
    startDate: string,
    endDate: string,
    first: number = 100,
    after?: string
  ): Promise<GraphQLReviewResponse> {
    try {
      const reviewQuery = this.buildReviewSearchQuery(
        login,
        startDate,
        endDate
      );
      const response = await this.graphqlWithAuth(GET_USER_REVIEWS_QUERY, {
        reviewQuery,
        first,
        after,
      });
      return response as GraphQLReviewResponse;
    } catch (error) {
      console.error("Error getting user reviews:", error);
      throw new Error(`Failed to get user reviews: ${error}`);
    }
  }

  /**
   * Build search query string for pull requests
   */
  buildPRSearchQuery(
    author: string,
    startDate: string,
    endDate: string,
    repositories?: string[]
  ): string {
    let query = `author:${author} is:pr created:${startDate}..${endDate}`;

    if (repositories && repositories.length > 0) {
      const repoQuery = repositories.map((repo) => `repo:${repo}`).join(" ");
      query = `${query} ${repoQuery}`;
    }

    return query;
  }

  /**
   * Build search query string for all pull requests (no author filter)
   */
  buildAllPRSearchQuery(
    startDate: string,
    endDate: string,
    repositories?: string[]
  ): string {
    let query = `is:pr created:${startDate}..${endDate}`;

    if (repositories && repositories.length > 0) {
      const repoQuery = repositories.map((repo) => `repo:${repo}`).join(" ");
      query = `${query} ${repoQuery}`;
    }

    return query;
  }

  /**
   * Build search query string for reviewed pull requests
   */
  buildReviewSearchQuery(
    reviewer: string,
    startDate: string,
    endDate: string,
    repositories?: string[]
  ): string {
    let query = `type:pr reviewed-by:${reviewer} created:${startDate}..${endDate}`;

    if (repositories && repositories.length > 0) {
      const repoQuery = repositories.map((repo) => `repo:${repo}`).join(" ");
      query = `${query} (${repoQuery})`;
    }

    return query;
  }

  /**
   * Calculate time to merge in minutes
   */
  calculateTimeToMerge(
    createdAt: string,
    mergedAt: string | null
  ): number | null {
    if (!mergedAt) return null;

    const created = new Date(createdAt);
    const merged = new Date(mergedAt);
    const diffMs = merged.getTime() - created.getTime();
    return diffMs / (1000 * 60); // Convert to minutes
  }

  /**
   * リポジトリ全体のプルリクエスト統計を取得
   */
  async getRepositoryPullRequestStats(
    repositoryName: string,
    startDate: string,
    endDate: string
  ): Promise<{
    total: number;
    merged: number;
    open: number;
    closed: number;
    firstPrDate: string | null;
    lastPrDate: string | null;
  }> {
    try {
      // 全PRを検索
      const allPrQuery = `repo:${repositoryName} type:pr created:${startDate}..${endDate}`;
      const allPrResponse = await this.searchPullRequests(allPrQuery, 100);

      let allPrs: any[] = [];
      let hasNextPage = true;
      let after: string | undefined;

      // 全ページを取得
      while (hasNextPage && allPrs.length < 1000) {
        // 最大1000件に制限
        const response = await this.searchPullRequests(allPrQuery, 100, after);
        allPrs = allPrs.concat(response.search.edges.map((edge) => edge.node));
        hasNextPage = response.search.pageInfo.hasNextPage;
        after = response.search.pageInfo.endCursor || undefined;
      }

      // 統計を計算
      const total = allPrs.length;
      const merged = allPrs.filter((pr) => pr.state === "MERGED").length;
      const open = allPrs.filter((pr) => pr.state === "OPEN").length;
      const closed = allPrs.filter((pr) => pr.state === "CLOSED").length;

      // 日付を計算
      const dates = allPrs.map((pr) => pr.createdAt).sort();
      const firstPrDate = dates.length > 0 ? dates[0] : null;
      const lastPrDate = dates.length > 0 ? dates[dates.length - 1] : null;

      return {
        total,
        merged,
        open,
        closed,
        firstPrDate,
        lastPrDate,
      };
    } catch (error) {
      console.error(
        `Error fetching repository stats for ${repositoryName}:`,
        error
      );
      // エラーが発生した場合はデフォルト値を返す
      return {
        total: 0,
        merged: 0,
        open: 0,
        closed: 0,
        firstPrDate: null,
        lastPrDate: null,
      };
    }
  }

  /**
   * 特定のプルリクエストを取得
   */
  async getSinglePullRequest(
    repositoryOwner: string,
    repositoryName: string,
    prNumber: number
  ): Promise<any> {
    try {
      const response = await this.graphqlWithAuth(GET_SINGLE_PULL_REQUEST_QUERY, {
        owner: repositoryOwner,
        name: repositoryName,
        number: prNumber,
      }) as any;

      const pr = response.repository?.pullRequest;
      if (!pr) {
        throw new Error(`Pull request #${prNumber} not found in repository ${repositoryOwner}/${repositoryName}`);
      }

      // レスポンスを既存の形式に合わせて変換
      const transformedPr = {
        ...pr,
        pr_number: pr.number,
        created_at: pr.createdAt,
        updated_at: pr.updatedAt,
        merged_at: pr.mergedAt,
        closed_at: pr.closedAt,
        changed_files: pr.changedFiles,
        comments_on_pr_total_count: pr.comments.totalCount,
        reviews_submitted_total_count: pr.reviews.totalCount,
        review_threads_total_count: pr.reviewThreads.totalCount,
        time_to_merge_minutes: pr.mergedAt ? this.calculateTimeToMerge(pr.createdAt, pr.mergedAt) : null,
        ready_for_review_at: pr.timelineItems.nodes.length > 0 ? pr.timelineItems.nodes[0].createdAt : pr.createdAt,
      };

      // 最初の承認情報を計算
      const approvals = pr.reviews.nodes.filter((review: any) => review.state === 'APPROVED');
      if (approvals.length > 0) {
        const firstApproval = approvals.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
        transformedPr.first_approval_at = firstApproval.createdAt;
        transformedPr.first_approver = firstApproval.author?.login;
        transformedPr.time_to_first_approval_minutes = this.calculateTimeToMerge(transformedPr.ready_for_review_at, firstApproval.createdAt);
      } else {
        transformedPr.first_approval_at = null;
        transformedPr.first_approver = null;
        transformedPr.time_to_first_approval_minutes = null;
      }

      return transformedPr;
    } catch (error) {
      console.error(`Error fetching pull request #${prNumber}:`, error);
      throw new Error(`Failed to fetch pull request #${prNumber}: ${error}`);
    }
  }
}
