import { Client } from '@notionhq/client';
import { Octokit } from 'octokit';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import { DATE_CONSTANTS, ENV_KEYS, GITHUB_CONSTANTS, NOTION_CONSTANTS } from './constants';
import { getRequiredEnvVar, validateRequiredEnvVars } from './utils/env';
import {
  ApprovedReview,
  FormattedPullRequest,
  GitHubPullRequest,
  GitHubPullRequestDetail,
  GitHubPullRequestReview,
  NotionPageProperties,
} from './types';
import { withGitHubErrorHandling, withNotionErrorHandling } from './utils/error-handler';
import { Logger } from './utils/logger';
import { processBatch } from './utils/batch';

// 環境変数の読み込み
dotenv.config();

/**
 * GitHubからマージ済みPRを取得する
 *
 * @param octokit GitHubクライアント
 * @param owner リポジトリオーナー
 * @param repo リポジトリ名
 * @returns マージ済みPRのリスト
 */
export async function fetchMergedPullRequests(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<GitHubPullRequest[]> {
  const mergedPrs: GitHubPullRequest[] = [];
  let page = 1;

  try {
    Logger.info(`マージ済みPRの取得を開始します: ${owner}/${repo}`);

    for (;;) {
      Logger.debug(`PRを検索中: page=${page}`);

      const res = await withGitHubErrorHandling(
        () =>
          octokit.rest.search.issuesAndPullRequests({
            q: `repo:${owner}/${repo} is:pr is:merged merged:>=${GITHUB_CONSTANTS.MERGED_SINCE}`,
            per_page: GITHUB_CONSTANTS.PER_PAGE,
            page,
          }),
        'マージ済みPRの取得',
        { owner, repo, page }
      );

      if (!res.data.items.length) {
        Logger.debug(`これ以上PRはありません: page=${page}`);
        break;
      }

      Logger.debug(`${res.data.items.length}件のPRを取得しました: page=${page}`);
      page++;
      mergedPrs.push(...res.data.items);
    }

    Logger.info(`${mergedPrs.length}件のマージ済みPRを取得しました`);
    return mergedPrs;
  } catch (error) {
    Logger.error('マージ済みPRの取得に失敗しました', error);
    throw error;
  }
}

/**
 * PRの詳細情報を取得する
 *
 * @param octokit GitHubクライアント
 * @param owner リポジトリオーナー
 * @param repo リポジトリ名
 * @param pr GitHubのPR情報
 * @returns 整形済みPR情報
 */
export async function fetchPullRequestDetails(
  octokit: Octokit,
  owner: string,
  repo: string,
  pr: GitHubPullRequest
): Promise<FormattedPullRequest> {
  try {
    Logger.debug(`PR詳細情報の取得を開始: PR #${pr.number} "${pr.title}"`);

    const { data: prDetail } = await withGitHubErrorHandling(
      () =>
        octokit.rest.pulls.get({
          owner,
          repo,
          pull_number: pr.number,
        }),
      'PR詳細の取得',
      { owner, repo, pullNumber: pr.number }
    );

    Logger.debug(`PRレビュー情報の取得を開始: PR #${pr.number}`);
    const { data: reviews } = await withGitHubErrorHandling(
      () =>
        octokit.rest.pulls.listReviews({
          owner,
          repo,
          pull_number: pr.number,
        }),
      'PRレビューの取得',
      { owner, repo, pullNumber: pr.number }
    );

    const approvedReviews = reviews
      .filter((review) => review.state === 'APPROVED')
      .map(
        (review): ApprovedReview => ({
          reviewer: review.user?.login,
          approvedAt: dayjs(review.submitted_at).add(DATE_CONSTANTS.JST_OFFSET).format(DATE_CONSTANTS.FORMAT),
        })
      );

    Logger.debug(`PR #${pr.number} の承認済みレビュー: ${approvedReviews.length}件`);

    return {
      prTitle: pr.title,
      prCreate: pr.user?.login,
      prUrl: pr.html_url,
      prCreatedAt: dayjs(pr.created_at).add(DATE_CONSTANTS.JST_OFFSET).format(DATE_CONSTANTS.FORMAT),
      prMergedAt: dayjs(pr.pull_request?.merged_at).add(DATE_CONSTANTS.JST_OFFSET).format(DATE_CONSTANTS.FORMAT),
      changedFiles: prDetail.changed_files,
      additions: prDetail.additions,
      deletions: prDetail.deletions,
      approvedReviews,
    };
  } catch (error) {
    Logger.error(`PR #${pr.number} の詳細取得に失敗しました`, error);
    throw error;
  }
}

/**
 * PR情報をNotionに登録する
 *
 * @param notion Notionクライアント
 * @param databaseId NotionのデータベースID
 * @param pr 整形済みPR情報
 * @returns Notionへの登録結果
 */
export async function createNotionPage(notion: Client, databaseId: string, pr: FormattedPullRequest): Promise<void> {
  try {
    Logger.debug(`Notionページの作成を開始: "${pr.prTitle}"`);

    const differenceInMinutes = calculateLeadTimeInMinutes(pr);
    const differenceInHours = Math.round((differenceInMinutes / 60) * 10) / 10;

    Logger.debug(`PR "${pr.prTitle}" のリードタイム: ${differenceInHours}時間`);

    const pageProperties = buildNotionPageProperties(pr, differenceInHours);

    await withNotionErrorHandling(
      () =>
        notion.pages.create({
          parent: { database_id: databaseId },
          properties: pageProperties,
        }),
      'Notionページの作成',
      { databaseId, prTitle: pr.prTitle }
    );

    Logger.debug(`Notionページの作成が完了しました: "${pr.prTitle}"`);
  } catch (error) {
    Logger.error(`PR "${pr.prTitle}" のNotionページ作成に失敗しました`, error);
    throw error;
  }
}

/**
 * PRのリードタイム（分）を計算する
 *
 * @param pr 整形済みPR情報
 * @returns リードタイム（分）
 */
export function calculateLeadTimeInMinutes(pr: FormattedPullRequest): number {
  try {
    return dayjs(pr.prMergedAt).diff(dayjs(pr.prCreatedAt), 'minute');
  } catch (error) {
    Logger.warn(`リードタイムの計算に失敗しました: ${pr.prTitle}`, error);
    return 0; // エラー時はデフォルト値として0を返す
  }
}

/**
 * Notionのページプロパティオブジェクトをビルドする
 *
 * @param pr 整形済みPR情報
 * @param leadTimeHours リードタイム（時間）
 * @returns Notionのページプロパティ
 */
export function buildNotionPageProperties(pr: FormattedPullRequest, leadTimeHours: number): NotionPageProperties {
  return {
    プルリク名: {
      title: [
        {
          text: {
            content: pr.prTitle,
          },
        },
      ],
    },
    作成者: {
      type: 'select',
      select: {
        name: pr.prCreate ?? '',
      },
    },
    削除行数: {
      type: 'number',
      number: pr.deletions,
    },
    作成日: {
      type: 'date',
      date: {
        start: pr.prCreatedAt,
        time_zone: NOTION_CONSTANTS.TIME_ZONE,
      },
    },
    修正ファイル: {
      type: 'number',
      number: pr.changedFiles,
    },
    追加行数: {
      type: 'number',
      number: pr.additions,
    },
    マージ時間: {
      type: 'date',
      date: {
        start: pr.prMergedAt,
        time_zone: NOTION_CONSTANTS.TIME_ZONE,
      },
    },
    URL: {
      type: 'url',
      url: pr.prUrl,
    },
    'リードタイム(h)': {
      type: 'number',
      number: leadTimeHours,
    },
    Approve時間: {
      type: 'rich_text',
      rich_text: pr.approvedReviews.flatMap((review) => [
        {
          text: {
            content: `${review.reviewer}: `,
          },
          annotations: {
            bold: true,
          },
        },
        {
          text: {
            content: `${review.approvedAt}\n`,
          },
        },
      ]),
    },
  };
}

/**
 * PR情報を取得してNotionに登録する処理
 *
 * @param pr GitHubのPR情報
 * @param octokit GitHubクライアント
 * @param notion Notionクライアント
 * @param owner リポジトリオーナー
 * @param repo リポジトリ名
 * @param databaseId NotionのデータベースID
 * @returns 処理結果
 */
export async function processPullRequest(
  pr: GitHubPullRequest,
  octokit: Octokit,
  notion: Client,
  owner: string,
  repo: string,
  databaseId: string
): Promise<{ success: boolean; pr: GitHubPullRequest; error?: Error }> {
  try {
    Logger.info(`PR #${pr.number} "${pr.title}" の処理を開始します`);

    // PR詳細を取得
    const prDetails = await fetchPullRequestDetails(octokit, owner, repo, pr);

    // Notionにページを作成
    await createNotionPage(notion, databaseId, prDetails);

    Logger.info(`PR #${pr.number} "${pr.title}" の処理が完了しました`);
    return { success: true, pr };
  } catch (error) {
    const e = error instanceof Error ? error : new Error(String(error));
    Logger.error(`PR #${pr.number} "${pr.title}" の処理中にエラーが発生しました`, e);
    return { success: false, pr, error: e };
  }
}

/**
 * メイン処理
 */
export default async function main() {
  try {
    Logger.info('プログラムを開始します');

    // 必須の環境変数をチェック
    Logger.debug('環境変数の検証を開始します');
    validateRequiredEnvVars([
      ENV_KEYS.GITHUB_ACCESS_TOKEN,
      ENV_KEYS.GITHUB_OWNER,
      ENV_KEYS.GITHUB_REPO,
      ENV_KEYS.NOTION_API_INTEGRATION_KEY,
      ENV_KEYS.NOTION_DATABASE_ID,
    ]);
    Logger.debug('環境変数の検証が完了しました');

    const octokit = new Octokit({ auth: getRequiredEnvVar(ENV_KEYS.GITHUB_ACCESS_TOKEN) });
    const notion = new Client({
      auth: getRequiredEnvVar(ENV_KEYS.NOTION_API_INTEGRATION_KEY),
    });
    const owner = getRequiredEnvVar(ENV_KEYS.GITHUB_OWNER);
    const repo = getRequiredEnvVar(ENV_KEYS.GITHUB_REPO);
    const databaseId = getRequiredEnvVar(ENV_KEYS.NOTION_DATABASE_ID);

    Logger.info(`リポジトリ: ${owner}/${repo}`);

    // マージ済みPRを取得
    const mergedPrs = await fetchMergedPullRequests(octokit, owner, repo);

    // バッチ処理でPRの処理を並行実行
    Logger.info(`${mergedPrs.length}件のPRに対する処理を開始します（バッチ処理）`);

    // バッチサイズと処理数のカウンター
    const batchSize = 3; // 同時に処理するPR数
    let successCount = 0;
    let failureCount = 0;
    const failedPrs: Array<{ pr: GitHubPullRequest; error: Error }> = [];

    // バッチ処理を実行
    await processBatch(
      mergedPrs,
      async (pr) => {
        return processPullRequest(pr, octokit, notion, owner, repo, databaseId);
      },
      {
        batchSize,
        onBatchComplete: (results, batchIndex, totalBatches) => {
          Logger.info(`バッチ${batchIndex + 1}/${totalBatches}の処理が完了しました`);

          // 成功・失敗の数をカウント
          results.forEach((result) => {
            if (result.success) {
              successCount++;
            } else {
              failureCount++;
              if (result.error) {
                failedPrs.push({ pr: result.pr, error: result.error });
              }
            }
          });

          Logger.info(
            `現在の進捗: 成功=${successCount}件, 失敗=${failureCount}件, 残り=${
              mergedPrs.length - (successCount + failureCount)
            }件`
          );
        },
        onItemError: (error, pr) => {
          Logger.error(`PR処理中にエラーが発生しました: ${pr.title}`, error);
          failedPrs.push({ pr, error });
          failureCount++;
        },
        retryCount: 2,
      }
    );

    // エラーサマリーの表示
    if (failedPrs.length > 0) {
      Logger.warn(`${failedPrs.length}件のPRの処理に失敗しました:`);
      for (const { pr, error } of failedPrs) {
        Logger.warn(`- PR #${pr.number} "${pr.title}": ${error.message}`);
      }
    }

    Logger.info(`処理完了: 成功=${successCount}件, 失敗=${failureCount}件`);
  } catch (error) {
    Logger.error('処理全体でエラーが発生しました', error);
    throw error;
  }
}

// スクリプトとして直接実行された場合のエントリーポイント
if (require.main === module) {
  main().catch((e) => {
    Logger.error('致命的なエラーが発生しました', e);
    process.exit(1);
  });
}
