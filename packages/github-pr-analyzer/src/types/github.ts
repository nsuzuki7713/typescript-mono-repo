export interface GitHubUser {
  login: string;
}

export interface GitHubRepository {
  nameWithOwner: string;
  owner: GitHubUser;
  name: string;
}

export interface GitHubLabel {
  name: string;
  color: string;
}

export interface GitHubMilestone {
  title: string;
  due_on: string | null;
}

export interface GitHubPullRequest {
  pr_number: number;
  title: string;
  body: string;
  url: string;
  repository: GitHubRepository;
  author: GitHubUser;
  state: "MERGED" | "CLOSED" | "OPEN";
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  closed_at: string | null;
  additions: number;
  deletions: number;
  changed_files: number;
  labels: GitHubLabel[];
  milestone: GitHubMilestone | null;
  assignees: GitHubUser[];
  comments_on_pr_total_count: number;
  reviews_submitted_total_count: number;
  review_threads_total_count: number;
  time_to_merge_hours: number | null;
}

export interface ReviewSummary {
  user: string;
  period_start: string;
  period_end: string;
  reviewed_pr_count: number;
  submitted_review_action_count: number;
  total_review_comments_given: number;
}

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

// GraphQL response types
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
  state: string;
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

export interface GraphQLSearchResponse {
  search: {
    edges: Array<{
      node: GraphQLPullRequest;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

export interface GraphQLReviewResponse {
  user: {
    pullRequestReviews: {
      nodes: Array<{
        pullRequest: {
          number: number;
          repository: {
            nameWithOwner: string;
          };
          createdAt: string;
          mergedAt: string | null;
        };
        state: string;
        submittedAt: string;
        comments: {
          totalCount: number;
        };
      }>;
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
  };
}
