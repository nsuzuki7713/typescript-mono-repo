/**
 * GitHubユーザー情報
 */
export interface GitHubUser {
  /** GitHubユーザー名 */
  login: string;
}

/**
 * GitHubリポジトリ情報
 */
export interface GitHubRepository {
  /** "owner/repository" 形式のフルネーム */
  nameWithOwner: string;
  /** リポジトリオーナー情報 */
  owner: GitHubUser;
  /** リポジトリ名 */
  name: string;
}

/**
 * GitHubラベル情報
 */
export interface GitHubLabel {
  /** ラベル名 */
  name: string;
  /** ラベルの色（16進数） */
  color: string;
}

/**
 * GitHubマイルストーン情報
 */
export interface GitHubMilestone {
  /** マイルストーンタイトル */
  title: string;
  /** 期限日（ISO 8601形式、null可） */
  due_on: string | null;
}

/**
 * プルリクエスト詳細情報（出力ファイル: created_prs_details_*.json）
 * ユーザーが作成したプルリクエストの詳細データ
 */
export interface GitHubPullRequest {
  /** プルリクエスト番号 */
  pr_number: number;
  /** プルリクエストタイトル */
  title: string;
  /** プルリクエスト本文 */
  body: string;
  /** プルリクエストURL */
  url: string;
  /** 対象リポジトリ情報 */
  repository: GitHubRepository;
  /** 作成者情報 */
  author: GitHubUser;
  /** プルリクエストの状態 */
  state: "MERGED" | "CLOSED" | "OPEN";
  /** 作成日時（ISO 8601形式） */
  created_at: string;
  /** 最終更新日時（ISO 8601形式） */
  updated_at: string;
  /** マージ日時（ISO 8601形式、null可） */
  merged_at: string | null;
  /** クローズ日時（ISO 8601形式、null可） */
  closed_at: string | null;
  /** 追加行数 */
  additions: number;
  /** 削除行数 */
  deletions: number;
  /** 変更ファイル数 */
  changed_files: number;
  /** 付与されたラベル一覧 */
  labels: GitHubLabel[];
  /** 関連マイルストーン */
  milestone: GitHubMilestone | null;
  /** アサインされたユーザー一覧 */
  assignees: GitHubUser[];
  /** プルリクエストに投稿されたコメント総数 */
  comments_on_pr_total_count: number;
  /** 提出されたレビュー総数 */
  reviews_submitted_total_count: number;
  /** レビュースレッド総数 */
  review_threads_total_count: number;
  /** マージまでの所要時間（分単位、null可） */
  time_to_merge_minutes: number | null;
  /** 最初の承認までの所要時間（分単位、null可） */
  time_to_first_approval_minutes: number | null;
  /** 最初の承認日時（ISO 8601形式、null可） */
  first_approval_at: string | null;
  /** 最初の承認者（null可） */
  first_approver: string | null;
  /** レビュー可能になった日時（ISO 8601形式） */
  ready_for_review_at: string;
}

/**
 * レビューサマリー情報（出力ファイル: my_review_summary_*.json）
 * ユーザーが行ったレビュー活動の統計情報
 */
export interface ReviewSummary {
  /** 対象ユーザー名 */
  user: string;
  /** 分析期間開始日（YYYY-MM-DD形式） */
  period_start: string;
  /** 分析期間終了日（YYYY-MM-DD形式） */
  period_end: string;
  /** レビューしたプルリクエスト数（重複除去） */
  reviewed_pr_count: number;
  /** 提出したレビューアクション総数（承認、変更要求、コメント等） */
  submitted_review_action_count: number;
  /** レビューで投稿したコメント総数 */
  total_review_comments_given: number;
}

/**
 * 全体サマリー情報（出力ファイル: overall_summary_*.json）
 * ユーザーのプルリクエスト作成活動の統計情報
 */
export interface OverallSummary {
  /** 対象ユーザー名 */
  user: string;
  /** 分析期間開始日（YYYY-MM-DD形式） */
  period_start: string;
  /** 分析期間終了日（YYYY-MM-DD形式） */
  period_end: string;
  /** 作成したプルリクエスト総数 */
  total_created_prs: number;
  /** マージされたプルリクエスト総数 */
  total_merged_prs: number;
  /** 作成したプルリクエストでの追加行数合計 */
  total_additions_in_created_prs: number;
  /** 作成したプルリクエストでの削除行数合計 */
  total_deletions_in_created_prs: number;
  /** 作成したプルリクエストで受け取ったコメント総数 */
  total_pr_body_comments_received: number;
  /** 作成したプルリクエストで受け取ったレビューコメント総数 */
  total_review_comments_received_on_created_prs: number;
}

/**
 * リポジトリサマリー情報（出力ファイル: repository_summary_*.json）
 * ユーザーが関係したリポジトリごとの活動統計
 */
export interface RepositorySummary {
  /** 対象ユーザー名 */
  user: string;
  /** 分析期間開始日（YYYY-MM-DD形式） */
  period_start: string;
  /** 分析期間終了日（YYYY-MM-DD形式） */
  period_end: string;
  /** リポジトリ別の活動統計 */
  repositories: RepositoryActivity[];
}

/**
 * リポジトリ別活動統計情報
 */
export interface RepositoryActivity {
  /** リポジトリ名（owner/repo形式） */
  repository_name: string;
  /** 作成したプルリクエスト数 */
  created_prs_count: number;
  /** マージされたプルリクエスト数 */
  merged_prs_count: number;
  /** 作成したプルリクエストでの追加行数 */
  total_additions: number;
  /** 作成したプルリクエストでの削除行数 */
  total_deletions: number;
  /** 作成したプルリクエストで受け取ったコメント数 */
  total_comments_received: number;
  /** 作成したプルリクエストで受け取ったレビューコメント数 */
  total_review_comments_received: number;
  /** レビューしたプルリクエスト数 */
  reviewed_prs_count: number;
  /** 提出したレビューアクション数 */
  review_actions_count: number;
  /** レビューで投稿したコメント数 */
  review_comments_given: number;
  /** 最初のプルリクエスト作成日 */
  first_pr_created_at: string | null;
  /** 最新のプルリクエスト作成日 */
  last_pr_created_at: string | null;
  /** リポジトリ全体統計 */
  repository_overall_stats: RepositoryOverallStats;
}

/**
 * リポジトリ全体統計情報（全メンバーの活動を含む）
 */
export interface RepositoryOverallStats {
  /** リポジトリの全プルリクエスト数（期間内） */
  total_prs_in_period: number;
  /** リポジトリの全マージ済みプルリクエスト数（期間内） */
  total_merged_prs_in_period: number;
  /** リポジトリの全オープンプルリクエスト数（期間内） */
  total_open_prs_in_period: number;
  /** リポジトリの全クローズ済みプルリクエスト数（期間内） */
  total_closed_prs_in_period: number;
  /** 分析対象ユーザーの貢献率（作成PR数 / 全PR数） */
  user_contribution_rate: number;
  /** リポジトリの最初のPR作成日（期間内） */
  first_pr_in_period: string | null;
  /** リポジトリの最新のPR作成日（期間内） */
  last_pr_in_period: string | null;
}

/**
 * チーム分析サマリー情報（出力ファイル: team_summary_[期間].json）
 * チーム全体の活動統計とメンバー比較
 */
export interface TeamSummary {
  /** チーム名（オプション） */
  team_name?: string;
  /** 分析期間開始日（YYYY-MM-DD形式） */
  period_start: string;
  /** 分析期間終了日（YYYY-MM-DD形式） */
  period_end: string;
  /** 分析対象メンバー一覧 */
  team_members: string[];
  /** チーム全体統計 */
  team_stats: {
    /** チーム全体の作成PR数 */
    total_team_prs: number;
    /** チーム全体のマージPR数 */
    total_team_merged_prs: number;
    /** チーム全体の追加行数 */
    total_team_additions: number;
    /** チーム全体の削除行数 */
    total_team_deletions: number;
    /** チーム全体のレビュー数 */
    total_team_reviews: number;
  };
  /** メンバー別活動統計 */
  members_stats: TeamMemberStats[];
  /** リポジトリ別チーム活動 */
  repositories: TeamRepositoryActivity[];
}

/**
 * チームメンバー別統計情報
 */
export interface TeamMemberStats {
  /** メンバー名 */
  member: string;
  /** 作成PR数 */
  created_prs: number;
  /** マージPR数 */
  merged_prs: number;
  /** 追加行数 */
  additions: number;
  /** 削除行数 */
  deletions: number;
  /** レビューしたPR数 */
  reviewed_prs: number;
  /** レビューアクション数 */
  review_actions: number;
  /** チーム内での貢献率（PR作成数ベース） */
  contribution_rate: number;
  /** 最も活発なリポジトリ */
  most_active_repo: string;
}

/**
 * チームのリポジトリ別活動統計
 */
export interface TeamRepositoryActivity {
  /** リポジトリ名 */
  repository_name: string;
  /** リポジトリでのチーム全体PR数 */
  team_prs_count: number;
  /** リポジトリでのチーム全体マージPR数 */
  team_merged_prs_count: number;
  /** メンバー別貢献度 */
  members_contribution: {
    member: string;
    prs_count: number;
    contribution_percentage: number;
  }[];
}

/**
 * チーム分析用設定
 */
export interface TeamConfig {
  /** チーム名（オプション） */
  team_name?: string;
  /** チームメンバーのGitHubユーザー名一覧 */
  team_members: string[];
  /** GitHub Token */
  github_token: string;
  /** 分析期間開始日 */
  period_start_date: string;
  /** 分析期間終了日 */
  period_end_date: string;
  /** 分析対象リポジトリ（オプション） */
  repositories?: string[];
  /** 出力ディレクトリ */
  output_dir: string;
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
    nodes: Array<{
      state: string;
      submittedAt: string;
      author: {
        login: string;
      };
    }>;
  };
  reviewThreads: {
    totalCount: number;
  };
  timelineItems: {
    nodes: Array<{
      createdAt: string;
    }>;
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
  search: {
    edges: Array<{
      node: {
        number: number;
        title: string;
        repository: {
          nameWithOwner: string;
        };
        createdAt: string;
        mergedAt: string | null;
        reviews: {
          nodes: Array<{
            author: {
              login: string;
            };
            state: string;
            submittedAt: string;
            comments: {
              totalCount: number;
            };
          }>;
        };
      };
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}
