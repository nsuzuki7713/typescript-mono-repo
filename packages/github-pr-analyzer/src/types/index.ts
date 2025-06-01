/**
 * GitHubユーザー情報
 */
export interface GitHubUser {
  login: string;
}

/**
 * GitHubリポジトリ情報
 */
export interface GitHubRepository {
  nameWithOwner: string;
  owner: GitHubUser;
  name: string;
}

/**
 * ラベル情報
 */
export interface Label {
  name: string;
  color: string;
}

/**
 * マイルストーン情報
 */
export interface Milestone {
  title: string;
  due_on: string | null;
}

/**
 * プルリクエストの状態
 */
export type PullRequestState = "MERGED" | "CLOSED" | "OPEN";

/**
 * プルリクエスト詳細情報
 */
export interface PullRequestDetail {
  pr_number: number;
  title: string;
  body: string;
  url: string;
  repository: GitHubRepository;
  author: GitHubUser;
  state: PullRequestState;
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  closed_at: string | null;
  additions: number;
  deletions: number;
  changed_files: number;
  labels: Label[];
  milestone: Milestone | null;
  assignees: GitHubUser[];
  comments_on_pr_total_count: number;
  reviews_submitted_total_count: number;
  review_threads_total_count: number;
  time_to_merge_hours: number | null;
}

/**
 * レビュー活動サマリー
 */
export interface ReviewSummary {
  user: string;
  period_start: string;
  period_end: string;
  reviewed_pr_count: number;
  submitted_review_action_count: number;
  total_review_comments_given: number;
}

/**
 * 全体サマリー情報
 */
export interface OverallSummary {
  user: string;
  period_start: string;
  period_end: string;
  total_created_prs: number;
  total_merged_prs: number;
  total_additions_in_created_prs: number;
  total_deletions_in_created_prs: number;
  total_pr_body_comments_received: number;
  total_review_comments_received_on_created_prs: number;
}

/**
 * GraphQLレスポンスの型定義
 */
export interface GraphQLPullRequest {
  number: number;
  title: string;
  body: string;
  url: string;
  repository: {
    nameWithOwner: string;
    owner: {
      login: string;
    };
    name: string;
  };
  author: {
    login: string;
  };
  state: PullRequestState;
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  closedAt: string | null;
  additions: number;
  deletions: number;
  changedFiles: number;
  labels: {
    nodes: Array<{
      name: string;
      color: string;
    }>;
  };
  milestone: {
    title: string;
    dueOn: string | null;
  } | null;
  assignees: {
    nodes: Array<{
      login: string;
    }>;
  };
  comments: {
    totalCount: number;
  };
  reviews: {
    totalCount: number;
  };
  reviewThreads: {
    totalCount: number;
  };
}

export interface GraphQLReview {
  pullRequest: {
    number: number;
    repository: {
      nameWithOwner: string;
    };
  };
  author: {
    login: string;
  };
  state: "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED" | "DISMISSED";
  comments: {
    totalCount: number;
  };
}
