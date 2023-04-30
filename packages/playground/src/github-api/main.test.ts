import { Octokit } from 'octokit';
import dotenv from 'dotenv';
import dayjs from 'dayjs';

dotenv.config();

describe('Octokitを使ってGitHub APIを操作する', () => {
  const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });
  const owner = process.env.GITHUB_OWNER ?? '';
  const repo = process.env.GITHUB_REPO ?? '';

  it('プルリクの一覧を取得する', async () => {
    // https://docs.github.com/ja/rest/pulls/pulls?apiVersion=2022-11-28#list-pull-requests
    const res = await octokit.rest.pulls.list({
      owner,
      repo,
      state: 'all',
    });

    console.log(res.data);
  });

  it('プルリクの詳細を取得取得する', async () => {
    // https://docs.github.com/ja/rest/pulls/pulls?apiVersion=2022-11-28#get-a-pull-request
    const res = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: 294,
    });

    console.log(res.data);
  });

  it('レビューの情報を取得する', async () => {
    // https://docs.github.com/ja/rest/pulls/reviews?apiVersion=2022-11-28#list-reviews-for-a-pull-request
    const { data: reviews } = await octokit.rest.pulls.listReviews({
      owner,
      repo,
      pull_number: 204,
    });

    console.log(reviews);
  });

  it('一週間以内にマージされたプルリクを取得する', async () => {
    // https://docs.github.com/ja/rest/search#search-issues-and-pull-requests
    const res = await octokit.rest.search.issuesAndPullRequests({
      q: `repo:${owner}/${repo} is:pr is:merged merged:>=2023-01-15`,
      page: 30,
    });

    console.log(res);
  });

  it('マージしたプルリクを取得して、プルリク作成日とマージ日を出す。また、approveした人の名前と時間も出す。', async () => {
    // https://docs.github.com/ja/rest/search#search-issues-and-pull-requests
    const res = await octokit.rest.search.issuesAndPullRequests({
      q: `repo:${owner}/${repo} is:pr is:merged merged:>=2023-04-25`,
    });

    const prs = res.data.items;

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
        prUrl: pr.html_url,
        prCreatedAt: dayjs(pr.created_at).add(9).format('YYYY/MM/DD HH:mm:ss'),
        prMergedAt: dayjs(pr.pull_request?.merged_at).add(9).format('YYYY/MM/DD HH:mm:ss'),
        changedFiles: prDetail.changed_files,
        additions: prDetail.additions,
        deletions: prDetail.deletions,
        approvedReviews: reviews
          .filter((review) => review.state === 'APPROVED')
          .map((review) => ({
            reviewer: review.user?.login,
            approvedAt: dayjs(review.submitted_at).add(9).format('YYYY/MM/DD HH:mm:ss'),
          })),
      };

      console.log(output);
    }
  });
});
