import { GitHubClient } from "../clients/githubClient";
import { PullRequestService } from "./pullRequestService";
import { ReviewService } from "./reviewService";
import { SummaryService } from "./summaryService";
import { ConfigManager, AppConfig } from "../config/config";
import { FileManager } from "../utils/fileManager";
import { Logger } from "../utils/logger";
import {
  GitHubPullRequest,
  ReviewSummary,
  OverallSummary,
} from "../types/github";

export class AnalyzerController {
  private githubClient: GitHubClient;
  private pullRequestService: PullRequestService;
  private reviewService: ReviewService;
  private summaryService: SummaryService;
  private config: AppConfig;

  constructor() {
    this.config = ConfigManager.getInstance().getConfig();
    this.githubClient = new GitHubClient(this.config.githubToken);
    this.pullRequestService = new PullRequestService(this.githubClient);
    this.reviewService = new ReviewService(this.githubClient);
    this.summaryService = new SummaryService();
  }

  /**
   * Execute the full analysis workflow
   */
  async executeFullAnalysis(): Promise<{
    pullRequestsFile: string;
    reviewSummaryFile: string;
    overallSummaryFile: string;
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

      Logger.info("Analysis completed successfully!");
      Logger.info(`Files generated:`);
      Logger.info(`- Pull requests: ${pullRequestsFile}`);
      Logger.info(`- Review summary: ${reviewSummaryFile}`);
      Logger.info(`- Overall summary: ${overallSummaryFile}`);

      return {
        pullRequestsFile,
        reviewSummaryFile,
        overallSummaryFile,
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
}
