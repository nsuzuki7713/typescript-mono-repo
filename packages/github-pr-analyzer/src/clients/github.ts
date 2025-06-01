import { graphql } from "@octokit/graphql";
import { GraphQLPullRequest, GraphQLReview } from "../types";
import { GET_USER_PULL_REQUESTS, GET_USER_REVIEWS } from "../graphql/queries";

/**
 * GitHub APIクライアント
 */
export class GitHubClient {
  private graphqlWithAuth: typeof graphql;

  constructor(token: string) {
    this.graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${token}`,
      },
    });
  }

  /**
   * ユーザーが作成したプルリクエストを取得
   */
  async getUserPullRequests(
    userLogin: string,
    startDate: string,
    endDate: string,
    repositories?: string[]
  ): Promise<GraphQLPullRequest[]> {
    const pullRequests: GraphQLPullRequest[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    // 検索クエリを構築
    let query = `author:${userLogin} is:pr created:${startDate}..${endDate}`;
    if (repositories && repositories.length > 0) {
      const repoQuery = repositories.map((repo) => `repo:${repo}`).join(" ");
      query = `${query} ${repoQuery}`;
    }

    while (hasNextPage) {
      try {
        const response: any = await this.graphqlWithAuth(
          GET_USER_PULL_REQUESTS,
          {
            query,
            first: 100,
            after: cursor,
          }
        );

        const edges = response.search.edges;
        const prs = edges.map((edge: any) => edge.node as GraphQLPullRequest);
        pullRequests.push(...prs);

        hasNextPage = response.search.pageInfo.hasNextPage;
        cursor = response.search.pageInfo.endCursor;

        // APIレート制限を考慮して少し待機
        await this.sleep(100);
      } catch (error) {
        console.error("Error fetching pull requests:", error);
        throw error;
      }
    }

    return pullRequests;
  }

  /**
   * ユーザーが行ったレビューを取得
   */
  async getUserReviews(
    userLogin: string,
    startDate: string,
    endDate: string,
    repositories?: string[]
  ): Promise<
    { pr: { number: number; repository: string }; reviews: GraphQLReview[] }[]
  > {
    const reviewData: {
      pr: { number: number; repository: string };
      reviews: GraphQLReview[];
    }[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    // 検索クエリを構築（レビューがあるPRを検索）
    let query = `is:pr reviewed-by:${userLogin} updated:${startDate}..${endDate}`;
    if (repositories && repositories.length > 0) {
      const repoQuery = repositories.map((repo) => `repo:${repo}`).join(" ");
      query = `${query} ${repoQuery}`;
    }

    while (hasNextPage) {
      try {
        const response: any = await this.graphqlWithAuth(GET_USER_REVIEWS, {
          query,
          first: 100,
          after: cursor,
        });

        const edges = response.search.edges;

        for (const edge of edges) {
          const pr = edge.node;
          const userReviews = pr.reviews.nodes.filter(
            (review: any) => review.author.login === userLogin
          );

          if (userReviews.length > 0) {
            reviewData.push({
              pr: {
                number: pr.number,
                repository: pr.repository.nameWithOwner,
              },
              reviews: userReviews,
            });
          }
        }

        hasNextPage = response.search.pageInfo.hasNextPage;
        cursor = response.search.pageInfo.endCursor;

        // APIレート制限を考慮して少し待機
        await this.sleep(100);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        throw error;
      }
    }

    return reviewData;
  }

  /**
   * 指定時間待機
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
