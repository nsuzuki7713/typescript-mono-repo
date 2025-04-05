import { Client } from '@notionhq/client';
import { Octokit } from 'octokit';
import * as main2 from '../../src/notion/main2';
import { mockNotion, mockOctokit, mockPullRequests } from './__mocks__/mockData';
import { Logger } from '../../src/notion/utils/logger';
import * as envUtils from '../../src/notion/utils/env';

// モックの設定
jest.mock('@notionhq/client');
jest.mock('octokit');
jest.mock('../../src/notion/utils/logger', () => ({
  Logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock('../../src/notion/utils/env', () => ({
  validateRequiredEnvVars: jest.fn(),
  getRequiredEnvVar: jest.fn().mockImplementation((key) => {
    const mockEnv: Record<string, string> = {
      GITHUB_ACCESS_TOKEN: 'mock-github-token',
      GITHUB_OWNER: 'test-owner',
      GITHUB_REPO: 'test-repo',
      NOTION_API_INTEGRATIO_KEY: 'mock-notion-token',
      NOTION_DATABASEID2: 'mock-database-id',
    };
    return mockEnv[key] || '';
  }),
}));

// fetchMergedPullRequests関数をテストするため、エクスポートされていない関数をモック化するため再定義
jest.mock('../../src/notion/main2', () => {
  const originalModule = jest.requireActual('../../src/notion/main2');
  return {
    __esModule: true,
    ...originalModule,
    // エクスポートされていない関数をモックするためにテスト用に明示的にエクスポート
    fetchMergedPullRequests: jest.fn(),
    fetchPullRequestDetails: jest.fn(),
    createNotionPage: jest.fn(),
    processPullRequest: jest.fn(),
  };
});

describe('main2.tsの機能テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // モックの初期化
    (Octokit as unknown as jest.Mock).mockImplementation(() => mockOctokit);
    (Client as unknown as jest.Mock).mockImplementation(() => mockNotion);

    // テスト用の環境変数設定
    process.env.GITHUB_ACCESS_TOKEN = 'mock-github-token';
    process.env.GITHUB_OWNER = 'test-owner';
    process.env.GITHUB_REPO = 'test-repo';
    process.env.NOTION_API_INTEGRATIO_KEY = 'mock-notion-token';
    process.env.NOTION_DATABASEID2 = 'mock-database-id';
  });

  describe('fetchMergedPullRequests', () => {
    test('マージされたPRを正しく取得できる', async () => {
      const mockFetchMergedPullRequests = main2.fetchMergedPullRequests as jest.Mock;
      mockFetchMergedPullRequests.mockResolvedValueOnce(mockPullRequests);

      const result = await main2.fetchMergedPullRequests(mockOctokit as unknown as Octokit, 'test-owner', 'test-repo');

      expect(result).toEqual(mockPullRequests);
      expect(mockOctokit.rest.search.issuesAndPullRequests).toHaveBeenCalledWith(
        expect.objectContaining({
          q: expect.stringContaining('repo:test-owner/test-repo is:pr is:merged'),
        })
      );
      expect(Logger.info).toHaveBeenCalled();
    });
  });

  describe('processPullRequest', () => {
    test('PRを正常に処理できる', async () => {
      const mockProcessPullRequest = main2.processPullRequest as jest.Mock;
      mockProcessPullRequest.mockResolvedValueOnce({ success: true, pr: mockPullRequests[0] });

      const result = await main2.processPullRequest(
        mockPullRequests[0],
        mockOctokit as unknown as Octokit,
        mockNotion as unknown as Client,
        'test-owner',
        'test-repo',
        'mock-database-id'
      );

      expect(result).toEqual({ success: true, pr: mockPullRequests[0] });
      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining(`PR #${mockPullRequests[0].number}`));
    });

    test('PR処理中にエラーが発生した場合はエラー情報を返す', async () => {
      const mockError = new Error('テストエラー');
      const mockProcessPullRequest = main2.processPullRequest as jest.Mock;
      mockProcessPullRequest.mockImplementationOnce(async () => {
        throw mockError;
      });

      const result = await main2.processPullRequest(
        mockPullRequests[0],
        mockOctokit as unknown as Octokit,
        mockNotion as unknown as Client,
        'test-owner',
        'test-repo',
        'mock-database-id'
      );

      expect(result).toEqual({
        success: false,
        pr: mockPullRequests[0],
        error: mockError,
      });
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('main関数', () => {
    test('メイン処理が正常に実行される', async () => {
      // 環境変数のチェックをモックする
      (envUtils.validateRequiredEnvVars as jest.Mock).mockImplementationOnce(() => {});

      // 各ステップをモック化
      const mockFetchMergedPullRequests = main2.fetchMergedPullRequests as jest.Mock;
      mockFetchMergedPullRequests.mockResolvedValueOnce(mockPullRequests);

      const mockProcessPullRequest = main2.processPullRequest as jest.Mock;
      mockProcessPullRequest
        .mockResolvedValueOnce({ success: true, pr: mockPullRequests[0] })
        .mockResolvedValueOnce({ success: true, pr: mockPullRequests[1] });

      // テスト実行
      await expect(main2.default()).resolves.not.toThrow();

      // 検証
      expect(envUtils.validateRequiredEnvVars).toHaveBeenCalled();
      expect(mockFetchMergedPullRequests).toHaveBeenCalled();
      expect(mockProcessPullRequest).toHaveBeenCalledTimes(mockPullRequests.length);
      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining('プログラムを開始します'));
    });

    test('環境変数の検証に失敗した場合はエラーになる', async () => {
      const mockError = new Error('環境変数エラー');
      (envUtils.validateRequiredEnvVars as jest.Mock).mockImplementationOnce(() => {
        throw mockError;
      });

      await expect(main2.default()).rejects.toThrow();
      expect(Logger.error).toHaveBeenCalledWith(expect.stringContaining('処理全体でエラーが発生しました'), mockError);
    });
  });
});
