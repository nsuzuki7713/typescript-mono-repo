import { Client } from '@notionhq/client';
import { Octokit } from 'octokit';
import dotenv from 'dotenv';
import dayjs from 'dayjs';

dotenv.config();

async function main() {
  const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });
  const notion = new Client({
    auth: process.env.NOTION_API_INTEGRATIO_KEY,
  });
  const owner = process.env.GITHUB_OWNER ?? '';
  const repo = process.env.GITHUB_REPO ?? '';

  const res = await octokit.rest.search.issuesAndPullRequests({
    q: `repo:${owner}/${repo} is:pr is:merged merged:>=2023-01-01`,
  });

  const prs = res.data.items;

  let count = 0;

  for (const pr of prs) {
    const { data: prDetail } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: pr.number,
    });

    const { data: reviews } = await octokit.rest.pulls.listReviews({
      owner,
      repo,
      pull_number: pr.number,
    });

    const output = {
      prTitle: pr.title,
      prCreate: pr.user?.login,
      prUrl: pr.html_url,
      prCreatedAt: dayjs(pr.created_at).add(9).format('YYYY-MM-DD HH:mm'),
      prMergedAt: dayjs(pr.pull_request?.merged_at).add(9).format('YYYY-MM-DD HH:mm'),
      changedFiles: prDetail.changed_files,
      additions: prDetail.additions,
      deletions: prDetail.deletions,
      approvedReviews: reviews
        .filter((review) => review.state === 'APPROVED')
        .map((review) => ({
          reviewer: review.user?.login,
          approvedAt: dayjs(review.submitted_at).add(9).format('YYYY-MM-DD HH:mm'),
        })),
    };

    const databaseId = process.env.NOTION_DATABASEID ?? '';

    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        プルリク名: {
          title: [
            {
              text: {
                content: output.prTitle,
              },
            },
          ],
        },
        作成者: {
          type: 'select',
          select: {
            name: output.prCreate ?? '',
          },
        },
        削除行数: {
          type: 'number',
          number: output.deletions,
        },
        作成日: {
          type: 'date',
          date: {
            start: output.prCreatedAt,
            time_zone: 'Asia/Tokyo',
          },
        },
        修正ファイル: {
          type: 'number',
          number: output.changedFiles,
        },
        追加行数: {
          type: 'number',
          number: output.additions,
        },
        マージ時間: {
          type: 'date',
          date: {
            start: output.prMergedAt,
            time_zone: 'Asia/Tokyo',
          },
        },
        URL: {
          type: 'url',
          url: output.prUrl,
        },
      },
    });

    for (const reviwer of output.approvedReviews) {
      await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          レビュー者: {
            type: 'select',
            select: {
              name: reviwer.reviewer ?? '',
            },
          },
          approve時間: {
            type: 'date',
            date: {
              start: reviwer.approvedAt,
              time_zone: 'Asia/Tokyo',
            },
          },
          親アイテム: {
            type: 'relation',
            relation: [
              {
                id: response.id,
              },
            ],
          },
        },
      });
    }

    count++;
    console.log(`${count}件の処理を完了`);
  }
}

main().catch((e) => console.error(e));
