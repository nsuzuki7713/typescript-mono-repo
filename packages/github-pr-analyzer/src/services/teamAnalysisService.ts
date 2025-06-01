import { GitHubClient } from "../clients/githubClient";
import { PullRequestService } from "./pullRequestService";
import { ReviewService } from "./reviewService";
import { FileManager } from "../utils/fileManager";
import { Logger } from "../utils/logger";
import {
  GitHubPullRequest,
  ReviewSummary,
  TeamSummary,
  TeamMemberStats,
  TeamRepositoryActivity,
  TeamConfig,
} from "../types/github";

/**
 * チーム全体の分析を行うサービス
 */
export class TeamAnalysisService {
  private githubClient: GitHubClient;
  private pullRequestService: PullRequestService;
  private reviewService: ReviewService;

  constructor(githubToken: string) {
    this.githubClient = new GitHubClient(githubToken);
    this.pullRequestService = new PullRequestService(this.githubClient);
    this.reviewService = new ReviewService(this.githubClient);
  }

  /**
   * チーム全体の分析を実行
   */
  async analyzeTeam(config: TeamConfig): Promise<{
    teamSummaryFile: string;
    memberDetailsFiles: string[];
  }> {
    Logger.info(
      `Starting team analysis for ${config.team_members.length} members`
    );
    Logger.info(`Team: ${config.team_name || "Unnamed Team"}`);
    Logger.info(
      `Period: ${config.period_start_date} to ${config.period_end_date}`
    );

    // 各メンバーのデータを収集
    const memberDataMap = new Map<
      string,
      {
        pullRequests: GitHubPullRequest[];
        reviewSummary: ReviewSummary;
      }
    >();

    const memberDetailsFiles: string[] = [];

    // 各メンバーのPRとレビューデータを並行で収集
    for (const member of config.team_members) {
      Logger.info(`Collecting data for member: ${member}`);

      try {
        // PRデータ収集
        const pullRequests =
          await this.pullRequestService.fetchUserPullRequests(
            member,
            config.period_start_date,
            config.period_end_date,
            config.repositories
          );

        // レビューデータ収集
        const reviewSummary = await this.reviewService.generateReviewSummary(
          member,
          config.period_start_date,
          config.period_end_date
        );

        memberDataMap.set(member, { pullRequests, reviewSummary });

        // 個別メンバーのファイル保存
        const memberPRFile = await this.saveMemberData(
          member,
          pullRequests,
          reviewSummary,
          config
        );
        memberDetailsFiles.push(memberPRFile);

        Logger.info(
          `Completed data collection for ${member}: ${pullRequests.length} PRs, ${reviewSummary.reviewed_pr_count} reviews`
        );
      } catch (error) {
        Logger.error(`Failed to collect data for member ${member}:`, error);
        // エラーが発生したメンバーは空のデータで継続
        memberDataMap.set(member, {
          pullRequests: [],
          reviewSummary: {
            user: member,
            period_start: config.period_start_date,
            period_end: config.period_end_date,
            reviewed_pr_count: 0,
            submitted_review_action_count: 0,
            total_review_comments_given: 0,
          },
        });
      }
    }

    // チームサマリー生成
    const teamSummary = this.generateTeamSummary(config, memberDataMap);

    // チームサマリーファイル保存
    const teamSummaryFile = await this.saveTeamSummary(teamSummary, config);

    Logger.info(`Team analysis completed successfully!`);
    Logger.info(`Team summary saved to: ${teamSummaryFile}`);
    Logger.info(
      `Member details files: ${memberDetailsFiles.length} files generated`
    );

    return {
      teamSummaryFile,
      memberDetailsFiles,
    };
  }

  /**
   * チームサマリーを生成
   */
  private generateTeamSummary(
    config: TeamConfig,
    memberDataMap: Map<
      string,
      { pullRequests: GitHubPullRequest[]; reviewSummary: ReviewSummary }
    >
  ): TeamSummary {
    Logger.info("Generating team summary...");

    // チーム全体統計を計算
    let totalTeamPRs = 0;
    let totalTeamMergedPRs = 0;
    let totalTeamAdditions = 0;
    let totalTeamDeletions = 0;
    let totalTeamReviews = 0;

    // メンバー別統計を生成
    const membersStats: TeamMemberStats[] = [];
    const repositoryMap = new Map<string, Map<string, number>>();

    for (const [member, data] of memberDataMap) {
      const { pullRequests, reviewSummary } = data;

      // メンバー統計計算
      const memberCreatedPRs = pullRequests.length;
      const memberMergedPRs = pullRequests.filter(
        (pr) => pr.state === "MERGED"
      ).length;
      const memberAdditions = pullRequests.reduce(
        (sum, pr) => sum + pr.additions,
        0
      );
      const memberDeletions = pullRequests.reduce(
        (sum, pr) => sum + pr.deletions,
        0
      );

      // チーム全体に加算
      totalTeamPRs += memberCreatedPRs;
      totalTeamMergedPRs += memberMergedPRs;
      totalTeamAdditions += memberAdditions;
      totalTeamDeletions += memberDeletions;
      totalTeamReviews += reviewSummary.reviewed_pr_count;

      // 最も活発なリポジトリを特定
      const repoCount = new Map<string, number>();
      pullRequests.forEach((pr) => {
        const repo = pr.repository.nameWithOwner;
        repoCount.set(repo, (repoCount.get(repo) || 0) + 1);

        // リポジトリ別メンバー貢献度を記録
        if (!repositoryMap.has(repo)) {
          repositoryMap.set(repo, new Map());
        }
        repositoryMap
          .get(repo)!
          .set(member, (repositoryMap.get(repo)!.get(member) || 0) + 1);
      });

      const mostActiveRepo =
        Array.from(repoCount.entries()).sort(([, a], [, b]) => b - a)[0]?.[0] ||
        "N/A";

      membersStats.push({
        member,
        created_prs: memberCreatedPRs,
        merged_prs: memberMergedPRs,
        additions: memberAdditions,
        deletions: memberDeletions,
        reviewed_prs: reviewSummary.reviewed_pr_count,
        review_actions: reviewSummary.submitted_review_action_count,
        contribution_rate: 0, // 後で計算
        most_active_repo: mostActiveRepo,
      });
    }

    // 貢献率を計算
    membersStats.forEach((stats) => {
      stats.contribution_rate =
        totalTeamPRs > 0
          ? Math.round((stats.created_prs / totalTeamPRs) * 100 * 100) / 100
          : 0;
    });

    // リポジトリ別チーム活動を生成
    const repositories: TeamRepositoryActivity[] = [];
    for (const [repoName, memberContributions] of repositoryMap) {
      const teamPrsCount = Array.from(memberContributions.values()).reduce(
        (sum, count) => sum + count,
        0
      );
      const teamMergedPrsCount = this.calculateTeamMergedPRsForRepo(
        repoName,
        memberDataMap
      );

      const membersContribution = Array.from(memberContributions.entries())
        .map(([member, count]) => ({
          member,
          prs_count: count,
          contribution_percentage:
            Math.round((count / teamPrsCount) * 100 * 100) / 100,
        }))
        .sort((a, b) => b.prs_count - a.prs_count);

      repositories.push({
        repository_name: repoName,
        team_prs_count: teamPrsCount,
        team_merged_prs_count: teamMergedPrsCount,
        members_contribution: membersContribution,
      });
    }

    // リポジトリをPR数で並び替え
    repositories.sort((a, b) => b.team_prs_count - a.team_prs_count);

    return {
      team_name: config.team_name,
      period_start: config.period_start_date,
      period_end: config.period_end_date,
      team_members: config.team_members,
      team_stats: {
        total_team_prs: totalTeamPRs,
        total_team_merged_prs: totalTeamMergedPRs,
        total_team_additions: totalTeamAdditions,
        total_team_deletions: totalTeamDeletions,
        total_team_reviews: totalTeamReviews,
      },
      members_stats: membersStats.sort((a, b) => b.created_prs - a.created_prs),
      repositories,
    };
  }

  /**
   * リポジトリごとのチームマージPR数を計算
   */
  private calculateTeamMergedPRsForRepo(
    repoName: string,
    memberDataMap: Map<
      string,
      { pullRequests: GitHubPullRequest[]; reviewSummary: ReviewSummary }
    >
  ): number {
    let mergedCount = 0;
    for (const [, data] of memberDataMap) {
      mergedCount += data.pullRequests.filter(
        (pr) =>
          pr.repository.nameWithOwner === repoName && pr.state === "MERGED"
      ).length;
    }
    return mergedCount;
  }

  /**
   * メンバーの個別データを保存
   */
  private async saveMemberData(
    member: string,
    pullRequests: GitHubPullRequest[],
    reviewSummary: ReviewSummary,
    config: TeamConfig
  ): Promise<string> {
    const memberData = {
      member,
      period_start: config.period_start_date,
      period_end: config.period_end_date,
      pull_requests: pullRequests,
      review_summary: reviewSummary,
    };

    const filename = FileManager.generateFilename(
      "team_member_details",
      member,
      config.period_start_date,
      config.period_end_date
    );

    return await FileManager.writeJsonFile(
      config.output_dir,
      filename,
      memberData
    );
  }

  /**
   * チームサマリーを保存
   */
  private async saveTeamSummary(
    teamSummary: TeamSummary,
    config: TeamConfig
  ): Promise<string> {
    const teamName = config.team_name || "team";
    const filename = `team_summary_${teamName}_${config.period_start_date}-${config.period_end_date}.json`;

    return await FileManager.writeJsonFile(
      config.output_dir,
      filename,
      teamSummary
    );
  }

  /**
   * チームサマリーをログ出力
   */
  logTeamSummary(summary: TeamSummary): void {
    Logger.info("=== Team Analysis Summary ===");
    Logger.info(`Team: ${summary.team_name || "Unnamed Team"}`);
    Logger.info(`Period: ${summary.period_start} to ${summary.period_end}`);
    Logger.info(`Members: ${summary.team_members.length}`);
    Logger.info("");

    Logger.info("Team Statistics:");
    Logger.info(`- Total PRs: ${summary.team_stats.total_team_prs}`);
    Logger.info(`- Merged PRs: ${summary.team_stats.total_team_merged_prs}`);
    Logger.info(`- Total Reviews: ${summary.team_stats.total_team_reviews}`);
    Logger.info(
      `- Code Changes: +${summary.team_stats.total_team_additions} -${summary.team_stats.total_team_deletions}`
    );
    Logger.info("");

    Logger.info("Top Contributors:");
    summary.members_stats.slice(0, 5).forEach((member, index) => {
      Logger.info(
        `${index + 1}. ${member.member}: ${member.created_prs} PRs (${
          member.contribution_rate
        }%)`
      );
    });
    Logger.info("");

    Logger.info("Most Active Repositories:");
    summary.repositories.slice(0, 5).forEach((repo, index) => {
      Logger.info(
        `${index + 1}. ${repo.repository_name}: ${repo.team_prs_count} PRs`
      );
    });
  }
}
