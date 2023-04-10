import { Octokit } from 'octokit';
import dotenv from 'dotenv';

dotenv.config();

describe('Octokitを使ってGitHub APIを操作する', () => {
  const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });
});
