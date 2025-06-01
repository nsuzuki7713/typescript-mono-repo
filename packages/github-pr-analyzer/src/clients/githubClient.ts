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
    query: string,
    first: number = 100,
    after?: string
  ): Promise<GraphQLSearchResponse> {
    try {
      const response = await this.graphqlWithAuth(SEARCH_PULL_REQUESTS_QUERY, {
        query,
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
    first: number = 100,
    after?: string
  ): Promise<GraphQLReviewResponse> {
    try {
      const response = await this.graphqlWithAuth(GET_USER_REVIEWS_QUERY, {
        login,
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
}
