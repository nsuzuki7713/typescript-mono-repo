/**
 * テスト用のモックデータ
 */
import { GitHubPullRequest, GitHubPullRequestDetail, GitHubPullRequestReview } from '../../../src/notion/types';

/**
 * モックGitHubのPRデータ
 */
export const mockPullRequests = [
  {
    number: 1,
    title: 'テスト用PR 1',
    html_url: 'https://github.com/test/repo/pull/1',
    user: {
      login: 'testuser1',
    },
    created_at: '2023-10-20T10:00:00Z',
    pull_request: {
      merged_at: '2023-10-21T15:00:00Z',
    },
  },
  {
    number: 2,
    title: 'テスト用PR 2',
    html_url: 'https://github.com/test/repo/pull/2',
    user: {
      login: 'testuser2',
    },
    created_at: '2023-10-22T09:30:00Z',
    pull_request: {
      merged_at: '2023-10-22T14:45:00Z',
    },
  },
] as GitHubPullRequest[];

/**
 * モックPR詳細データ
 */
export const mockPullRequestDetails = {
  1: {
    changed_files: 5,
    additions: 100,
    deletions: 50,
  },
  2: {
    changed_files: 3,
    additions: 30,
    deletions: 10,
  },
} as Record<number, GitHubPullRequestDetail>;

/**
 * モックPRレビューデータ
 */
export const mockPullRequestReviews = {
  1: [
    {
      user: {
        login: 'reviewer1',
      },
      state: 'APPROVED',
      submitted_at: '2023-10-21T14:30:00Z',
    },
    {
      user: {
        login: 'reviewer2',
      },
      state: 'APPROVED',
      submitted_at: '2023-10-21T14:45:00Z',
    },
  ],
  2: [
    {
      user: {
        login: 'reviewer1',
      },
      state: 'COMMENTED',
      submitted_at: '2023-10-22T11:30:00Z',
    },
    {
      user: {
        login: 'reviewer1',
      },
      state: 'APPROVED',
      submitted_at: '2023-10-22T13:45:00Z',
    },
  ],
} as Record<number, GitHubPullRequestReview[]>;

/**
 * モックOctokitクライアント
 */
export const mockOctokit = {
  rest: {
    search: {
      issuesAndPullRequests: jest.fn().mockImplementation(({ page }) => {
        // 1ページ目のみデータを返し、2ページ目は空配列を返す
        if (page === 1) {
          return Promise.resolve({
            data: {
              items: mockPullRequests,
            },
          });
        }
        return Promise.resolve({
          data: {
            items: [],
          },
        });
      }),
    },
    pulls: {
      get: jest.fn().mockImplementation(({ pull_number }) => {
        const prDetail = mockPullRequestDetails[pull_number];
        if (!prDetail) {
          return Promise.reject(new Error(`PR #${pull_number} が見つかりません`));
        }
        return Promise.resolve({
          data: prDetail,
        });
      }),
      listReviews: jest.fn().mockImplementation(({ pull_number }) => {
        const reviews = mockPullRequestReviews[pull_number];
        if (!reviews) {
          return Promise.reject(new Error(`PR #${pull_number} のレビューが見つかりません`));
        }
        return Promise.resolve({
          data: reviews,
        });
      }),
    },
  },
};

/**
 * モックNotionクライアント
 */
export const mockNotion = {
  pages: {
    create: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        id: 'mock-notion-page-id',
      });
    }),
  },
};
