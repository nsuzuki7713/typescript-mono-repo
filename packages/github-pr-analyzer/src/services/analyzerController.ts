import { GitHubClient } from "../clients/githubClient";
import { PullRequestService } from "./pullRequestService";
import { ReviewService } from "./reviewService";
import { SummaryService } from "./summaryService";
import { RepositoryService } from "./repositoryService";
import { ConfigManager, AppConfig } from "../config/config";
import { FileManager } from "../utils/fileManager";
import { Logger } from "../utils/logger";
import {
  GitHubPullRequest,
  ReviewSummary,
  OverallSummary,
  RepositorySummary,
} from "../types/github";

export class AnalyzerController {
  private githubClient: GitHubClient;
  private pullRequestService: PullRequestService;
  private reviewService: ReviewService;
  private summaryService: SummaryService;
  private repositoryService: RepositoryService;
  private config: AppConfig;

  constructor() {
    this.config = ConfigManager.getInstance().getConfig();
    this.githubClient = new GitHubClient(this.config.githubToken);
    this.pullRequestService = new PullRequestService(this.githubClient);
    this.reviewService = new ReviewService(this.githubClient);
    this.summaryService = new SummaryService();
    this.repositoryService = new RepositoryService(this.githubClient);
  }

  /**
   * Execute the full analysis workflow
   */
  async executeFullAnalysis(): Promise<{
    pullRequestsFile: string;
    reviewSummaryFile: string;
    overallSummaryFile: string;
    repositorySummaryFile: string;
  }> {
    try {
      Logger.info("Starting GitHub PR analysis...");
      Logger.info(
        `Configuration: User=${this.config.userLogin}, Period=${this.config.periodStartDate} to ${this.config.periodEndDate}`
      );

      // 1. Fetch and save pull request details
      const pullRequestsFile = await this.collectPullRequestDetails();

      // 2. Generate and save review summary
      const reviewSummaryFile = await this.generateReviewSummary();

      // 3. Generate and save overall summary
      const overallSummaryFile = await this.generateOverallSummary(
        pullRequestsFile
      );

      // 4. Generate and save repository summary
      const repositorySummaryFile = await this.generateRepositorySummary(
        pullRequestsFile,
        reviewSummaryFile
      );

      Logger.info("Analysis completed successfully!");
      Logger.info(`Files generated:`);
      Logger.info(`- Pull requests: ${pullRequestsFile}`);
      Logger.info(`- Review summary: ${reviewSummaryFile}`);
      Logger.info(`- Overall summary: ${overallSummaryFile}`);
      Logger.info(`- Repository summary: ${repositorySummaryFile}`);

      return {
        pullRequestsFile,
        reviewSummaryFile,
        overallSummaryFile,
        repositorySummaryFile,
      };
    } catch (error) {
      Logger.error("Analysis failed:", error);
      throw error;
    }
  }

  /**
   * Collect pull request details and save to JSON file
   */
  async collectPullRequestDetails(): Promise<string> {
    Logger.info("Collecting pull request details...");

    const pullRequests = await this.pullRequestService.fetchUserPullRequests(
      this.config.userLogin,
      this.config.periodStartDate,
      this.config.periodEndDate,
      this.config.repositories
    );

    const filename = FileManager.generateFilename(
      "created_prs_details",
      this.config.userLogin,
      this.config.periodStartDate,
      this.config.periodEndDate
    );

    const filePath = await FileManager.writeJsonFile(
      this.config.outputDir,
      filename,
      pullRequests
    );

    Logger.info(
      `Saved ${pullRequests.length} pull request details to: ${filePath}`
    );
    return filePath;
  }

  /**
   * Collect pull request details and return the data
   */
  async collectPullRequestsAndReturn(): Promise<GitHubPullRequest[]> {
    Logger.info("Collecting pull request details...");

    const pullRequests = await this.pullRequestService.fetchUserPullRequests(
      this.config.userLogin,
      this.config.periodStartDate,
      this.config.periodEndDate,
      this.config.repositories
    );

    Logger.info(`Collected ${pullRequests.length} pull requests`);
    return pullRequests;
  }

  /**
   * Generate review summary and save to JSON file
   */
  async generateReviewSummary(): Promise<string> {
    Logger.info("Generating review summary...");

    const reviewSummary = await this.reviewService.generateReviewSummary(
      this.config.userLogin,
      this.config.periodStartDate,
      this.config.periodEndDate
    );

    const filename = FileManager.generateFilename(
      "my_review_summary",
      this.config.userLogin,
      this.config.periodStartDate,
      this.config.periodEndDate
    );

    const filePath = await FileManager.writeJsonFile(
      this.config.outputDir,
      filename,
      reviewSummary
    );

    Logger.info(`Saved review summary to: ${filePath}`);
    return filePath;
  }

  /**
   * Generate review summary and return the data
   */
  async generateReviewSummaryAndReturn(): Promise<ReviewSummary> {
    Logger.info("Generating review summary...");

    const reviewSummary = await this.reviewService.generateReviewSummary(
      this.config.userLogin,
      this.config.periodStartDate,
      this.config.periodEndDate
    );

    Logger.info(`Generated review summary for ${reviewSummary.user}`);
    return reviewSummary;
  }

  /**
   * Collect all users' pull request details and return the data
   */
  async collectAllUsersPullRequestsAndReturn(): Promise<GitHubPullRequest[]> {
    Logger.info("Collecting all users' pull request details...");

    const pullRequests = await this.pullRequestService.fetchAllPullRequests(
      this.config.periodStartDate,
      this.config.periodEndDate,
      this.config.repositories
    );

    Logger.info(`Collected ${pullRequests.length} pull requests from all users`);
    return pullRequests;
  }

  /**
   * Collect specific pull request by number and repository
   */
  async collectSinglePullRequest(
    repositoryOwner: string,
    repositoryName: string,
    prNumber: number
  ): Promise<GitHubPullRequest> {
    Logger.info(`Collecting pull request #${prNumber} from ${repositoryOwner}/${repositoryName}...`);

    const pullRequest = await this.githubClient.getSinglePullRequest(
      repositoryOwner,
      repositoryName,
      prNumber
    );

    Logger.info(`Collected pull request #${prNumber}: ${pullRequest.title}`);
    return pullRequest;
  }

  /**
   * Generate overall summary and save to JSON file
   */
  async generateOverallSummary(pullRequestsFilePath: string): Promise<string> {
    Logger.info("Generating overall summary...");

    // Load pull request data from file
    const pullRequests = await FileManager.readJsonFile<GitHubPullRequest[]>(
      pullRequestsFilePath
    );

    const overallSummary = this.summaryService.generateOverallSummary(
      this.config.userLogin,
      this.config.periodStartDate,
      this.config.periodEndDate,
      pullRequests
    );

    const filename = FileManager.generateFilename(
      "overall_summary",
      this.config.userLogin,
      this.config.periodStartDate,
      this.config.periodEndDate
    );

    const filePath = await FileManager.writeJsonFile(
      this.config.outputDir,
      filename,
      overallSummary
    );

    Logger.info(`Saved overall summary to: ${filePath}`);
    return filePath;
  }

  /**
   * Generate repository summary
   */
  private async generateRepositorySummary(
    pullRequestsFilePath: string,
    reviewSummaryFilePath: string
  ): Promise<string> {
    Logger.info("Generating repository summary...");

    // Load data from files
    const pullRequests = await FileManager.readJsonFile<GitHubPullRequest[]>(
      pullRequestsFilePath
    );
    const reviewSummary = await FileManager.readJsonFile<ReviewSummary>(
      reviewSummaryFilePath
    );

    const repositorySummary =
      await this.repositoryService.generateRepositorySummary(
        pullRequests,
        reviewSummary,
        this.config.userLogin,
        this.config.periodStartDate,
        this.config.periodEndDate
      );

    // Log detailed statistics
    this.repositoryService.logRepositorySummary(repositorySummary);

    const filename = FileManager.generateFilename(
      "repository_summary",
      this.config.userLogin,
      this.config.periodStartDate,
      this.config.periodEndDate
    );

    const filePath = await FileManager.writeJsonFile(
      this.config.outputDir,
      filename,
      repositorySummary
    );

    Logger.info(`Saved repository summary to: ${filePath}`);
    return filePath;
  }

  /**
   * Execute individual analysis steps
   */
  async collectPullRequestsOnly(): Promise<string> {
    return await this.collectPullRequestDetails();
  }

  async generateReviewSummaryOnly(): Promise<string> {
    return await this.generateReviewSummary();
  }

  async generateOverallSummaryOnly(
    pullRequestsFilePath: string
  ): Promise<string> {
    return await this.generateOverallSummary(pullRequestsFilePath);
  }

  async generateRepositorySummaryOnly(
    pullRequestsFilePath: string,
    reviewSummaryFilePath: string
  ): Promise<string> {
    return await this.generateRepositorySummary(
      pullRequestsFilePath,
      reviewSummaryFilePath
    );
  }
}
