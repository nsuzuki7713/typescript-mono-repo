import { Octokit } from 'octokit';

/**
 * GitHub PR関連の型定義
 */
export type GitHubPullRequest = Awaited<
  ReturnType<typeof Octokit.prototype.rest.search.issuesAndPullRequests>
>['data']['items'][0];

export type GitHubPullRequestDetail = Awaited<ReturnType<typeof Octokit.prototype.rest.pulls.get>>['data'];

export type GitHubPullRequestReview = Awaited<ReturnType<typeof Octokit.prototype.rest.pulls.listReviews>>['data'][0];

export interface ApprovedReview {
  reviewer: string | undefined;
  approvedAt: string;
}

/**
 * Notion用に整形されたPR情報
 */
export interface FormattedPullRequest {
  prTitle: string;
  prCreate: string | undefined;
  prUrl: string;
  prCreatedAt: string;
  prMergedAt: string;
  changedFiles: number;
  additions: number;
  deletions: number;
  approvedReviews: ApprovedReview[];
}

/**
 * Notion用のリッチテキスト
 */
export interface NotionRichText {
  text: {
    content: string;
  };
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
    color?: string;
  };
}

/**
 * NotionのDatabaseページ作成時のプロパティ
 */
export interface NotionPageProperties {
  [key: string]: {
    title?: {
      text: {
        content: string;
      };
    }[];
    type?: string;
    select?: {
      name: string;
    };
    number?: number;
    date?: {
      start: string;
      time_zone: string;
    };
    url?: string;
    rich_text?: NotionRichText[];
  };
}
