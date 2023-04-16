import { Octokit } from 'octokit';
import dotenv from 'dotenv';

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
      pull_number: 204,
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
});
