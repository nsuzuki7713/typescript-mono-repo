import { graphql } from "@octokit/graphql";
import { GraphQLSearchResponse, GraphQLReviewResponse } from "../types/github";
import { SEARCH_PULL_REQUESTS_QUERY } from "../graphql/pullRequests";
import { GET_USER_REVIEWS_QUERY } from "../graphql/reviews";

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
   * Calculate time to merge in hours
   */
  calculateTimeToMerge(
    createdAt: string,
    mergedAt: string | null
  ): number | null {
    if (!mergedAt) return null;

    const created = new Date(createdAt);
    const merged = new Date(mergedAt);
    const diffMs = merged.getTime() - created.getTime();
    return diffMs / (1000 * 60 * 60); // Convert to hours
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
}
