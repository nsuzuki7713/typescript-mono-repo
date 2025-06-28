#!/usr/bin/env node

import { Command } from "commander";
import dotenv from "dotenv";
import { AnalyzerController } from "./services/analyzerController";
import { ConfigManager, AppConfig, TeamConfigManager } from "./config/config";
import { Logger } from "./utils/logger";
import { TeamAnalysisService } from "./services/teamAnalysisService";
import { PromptGeneratorService } from "./services/promptGeneratorService";
import { TeamConfig } from "./types/github";
import { CSVExportService } from "./services/csvExportService";
import { GoogleSheetsService } from "./services/googleSheetsService";

// Load environment variables
dotenv.config();

/**
 * 設定を読み込んで検証
 */
function loadAndValidateConfig(): AppConfig {
  try {
    const configManager = ConfigManager.getInstance();
    return configManager.getConfig();
  } catch (error) {
    Logger.error(`Configuration error: ${error}`);
    process.exit(1);
  }
}

/**
 * チーム設定を読み込んで検証
 */
function loadAndValidateTeamConfig(): TeamConfig {
  try {
    const configManager = TeamConfigManager.getInstance();
    return configManager.getTeamConfig();
  } catch (error) {
    Logger.error(`Team configuration error: ${error}`);
    process.exit(1);
  }
}

/**
 * メイン関数
 */
async function main() {
  const program = new Command();

  program
    .name("github-pr-analyzer")
    .description(
      "GitHub Pull Request analysis tool for engineering self-evaluation"
    )
    .version("1.0.0");

  // 全分析実行コマンド
  program
    .command("analyze")
    .description(
      "Run full analysis (pull requests + reviews + summary + repository summary)"
    )
    .action(async () => {
      try {
        const controller = new AnalyzerController();
        await controller.executeFullAnalysis();
      } catch (error) {
        Logger.error(`Analysis failed: ${error}`);
        process.exit(1);
      }
    });

  // プルリクエスト詳細収集コマンド
  program
    .command("pull-requests")
    .description("Collect pull request details only")
    .action(async () => {
      try {
        const controller = new AnalyzerController();
        await controller.collectPullRequestsOnly();
      } catch (error) {
        Logger.error(`Pull request collection failed: ${error}`);
        process.exit(1);
      }
    });

  // レビューサマリー生成コマンド
  program
    .command("reviews")
    .description("Generate review summary only")
    .action(async () => {
      try {
        const controller = new AnalyzerController();
        await controller.generateReviewSummaryOnly();
      } catch (error) {
        Logger.error(`Review summary generation failed: ${error}`);
        process.exit(1);
      }
    });

  // 全体サマリー生成コマンド
  program
    .command("summary")
    .description("Generate overall summary from existing PR details file")
    .argument("<pr-details-file>", "Path to PR details JSON file")
    .action(async (prDetailsFile: string) => {
      try {
        const controller = new AnalyzerController();
        await controller.generateOverallSummaryOnly(prDetailsFile);
      } catch (error) {
        Logger.error(`Summary generation failed: ${error}`);
        process.exit(1);
      }
    });

  // リポジトリサマリー生成コマンド
  program
    .command("repository-summary")
    .description(
      "Generate repository summary from existing PR details and review summary files"
    )
    .argument("<pr-details-file>", "Path to PR details JSON file")
    .argument("<review-summary-file>", "Path to review summary JSON file")
    .action(async (prDetailsFile: string, reviewSummaryFile: string) => {
      try {
        const controller = new AnalyzerController();
        await controller.generateRepositorySummaryOnly(
          prDetailsFile,
          reviewSummaryFile
        );
      } catch (error) {
        Logger.error(`Repository summary generation failed: ${error}`);
        process.exit(1);
      }
    });

  // 設定表示コマンド
  program
    .command("config")
    .description("Display current configuration")
    .action(() => {
      try {
        const config = loadAndValidateConfig();
        console.log("Current configuration:");
        console.log(
          JSON.stringify(
            {
              ...config,
              githubToken: config.githubToken ? "[HIDDEN]" : "[NOT SET]",
            },
            null,
            2
          )
        );
      } catch (error) {
        Logger.error(`Configuration error: ${error}`);
        process.exit(1);
      }
    });

  // チーム分析コマンド
  program
    .command("team-analyze")
    .description("Run team analysis for multiple team members")
    .action(async () => {
      try {
        const teamConfig = loadAndValidateTeamConfig();
        const teamAnalysisService = new TeamAnalysisService(
          teamConfig.github_token
        );
        const result = await teamAnalysisService.analyzeTeam(teamConfig);

        Logger.info("=== Team Analysis Completed ===");
        Logger.info(`Team summary: ${result.teamSummaryFile}`);
        Logger.info(
          `Member details: ${result.memberDetailsFiles.length} files generated`
        );
      } catch (error) {
        Logger.error(`Team analysis failed: ${error}`);
        process.exit(1);
      }
    });

  // チーム設定確認コマンド
  program
    .command("team-config")
    .description("Display current team configuration")
    .action(async () => {
      try {
        const teamConfig = loadAndValidateTeamConfig();
        console.log("Current team configuration:");
        console.log(
          JSON.stringify(
            {
              ...teamConfig,
              github_token: teamConfig.github_token ? "[HIDDEN]" : "[NOT SET]",
            },
            null,
            2
          )
        );
      } catch (error) {
        Logger.error(`Team configuration error: ${error}`);
        process.exit(1);
      }
    });

  // 個人分析プロンプト生成コマンド
  program
    .command("generate-prompt")
    .description(
      "Generate analysis prompt with actual data for individual analysis"
    )
    .action(async () => {
      try {
        const config = loadAndValidateConfig();
        const promptFile =
          await PromptGeneratorService.generateIndividualAnalysisPrompt(
            config.userLogin,
            config.periodStartDate,
            config.periodEndDate,
            config.outputDir
          );

        Logger.info("=== Individual Analysis Prompt Generated ===");
        Logger.info(`Prompt file: ${promptFile}`);
        Logger.info(
          "You can copy and paste this prompt to AI tools for analysis."
        );
      } catch (error) {
        Logger.error(`Prompt generation failed: ${error}`);
        process.exit(1);
      }
    });

  // チーム分析プロンプト生成コマンド
  program
    .command("generate-team-prompt")
    .description("Generate analysis prompt with actual data for team analysis")
    .action(async () => {
      try {
        Logger.info("Starting team prompt generation...");
        const teamConfig = loadAndValidateTeamConfig();
        Logger.info(
          `Team config loaded: ${JSON.stringify(teamConfig, null, 2)}`
        );

        const teamName = teamConfig.team_name || "team";
        Logger.info(`Using team name: ${teamName}`);

        const promptFile =
          await PromptGeneratorService.generateTeamAnalysisPrompt(
            teamName,
            teamConfig.period_start_date,
            teamConfig.period_end_date,
            teamConfig.output_dir
          );

        Logger.info("=== Team Analysis Prompt Generated ===");
        Logger.info(`Prompt file: ${promptFile}`);
        Logger.info(
          "You can copy and paste this prompt to AI tools for analysis."
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        Logger.error(`Team prompt generation failed: ${errorMessage}`);
        if (errorStack) {
          Logger.error(`Error stack: ${errorStack}`);
        }
        process.exit(1);
      }
    });

  // CSV エクスポートコマンド
  program
    .command("export-csv")
    .description("Export pull request data to CSV format")
    .option("-o, --output <dir>", "Output directory", "./output")
    .option("-u, --user <user>", "Target user (default: from config)")
    .option("-s, --start <date>", "Start date (YYYY-MM-DD, default: from config)")
    .option("-e, --end <date>", "End date (YYYY-MM-DD, default: from config)")
    .option("--pr-only", "Export pull requests only")
    .option("--review-only", "Export review summary only")
    .option("--combined", "Export combined data (default)")
    .option("--all-users", "Export all users' pull requests (default: true)")
    .option("--single-user", "Export specific user's pull requests only")
    .action(async (options) => {
      try {
        const config = loadAndValidateConfig();
        const csvExportService = new CSVExportService();
        const controller = new AnalyzerController();

        const outputDir = options.output || config.outputDir;
        const user = options.user || config.userLogin;
        const startDate = options.start || config.periodStartDate;
        const endDate = options.end || config.periodEndDate;
        const allUsers = !options.singleUser; // single-userオプションがない場合はデフォルトでtrue

        Logger.info(`=== CSV Export Started ===`);
        if (allUsers) {
          Logger.info(`Mode: All users in repositories`);
        } else {
          Logger.info(`User: ${user}`);
        }
        Logger.info(`Period: ${startDate} - ${endDate}`);
        Logger.info(`Output: ${outputDir}`);

        let pullRequests: any[] = [];
        let reviewSummary: any = null;
        let csvFilePath: string;

        if (allUsers) {
          // 全ユーザーのプルリクエストを取得
          if (!options.reviewOnly) {
            try {
              pullRequests = await controller.collectAllUsersPullRequestsAndReturn();
            } catch (error) {
              Logger.error(`Failed to fetch all users' pull requests: ${error}`);
              throw error;
            }
          }

          if (options.prOnly || (!options.reviewOnly && !options.combined)) {
            csvFilePath = await csvExportService.exportAllUsersPullRequestsToCSV(pullRequests, {
              outputDir,
              filename: `all_users_pull_requests_${startDate}_${endDate}.csv`
            });
          } else {
            Logger.warn("Review summary and combined exports are not supported for all-users mode. Using pull requests only.");
            csvFilePath = await csvExportService.exportAllUsersPullRequestsToCSV(pullRequests, {
              outputDir,
              filename: `all_users_pull_requests_${startDate}_${endDate}.csv`
            });
          }
        } else {
          // 特定ユーザーのデータを取得（既存ロジック）
          const prDetailsFile = `${outputDir}/created_prs_details_${user}_${startDate}_${endDate}.json`;
          const reviewSummaryFile = `${outputDir}/my_review_summary_${user}_${startDate}_${endDate}.json`;

          try {
            const fs = await import('fs/promises');
            
            if (!options.reviewOnly) {
              try {
                const prData = await fs.readFile(prDetailsFile, 'utf-8');
                pullRequests = JSON.parse(prData);
                Logger.info(`Loaded ${pullRequests.length} pull requests from ${prDetailsFile}`);
              } catch (error) {
                Logger.warn(`Could not load PR data from ${prDetailsFile}, fetching from GitHub...`);
                pullRequests = await controller.collectPullRequestsAndReturn();
              }
            }

            if (!options.prOnly) {
              try {
                const reviewData = await fs.readFile(reviewSummaryFile, 'utf-8');
                reviewSummary = JSON.parse(reviewData);
                Logger.info(`Loaded review summary from ${reviewSummaryFile}`);
              } catch (error) {
                Logger.warn(`Could not load review summary from ${reviewSummaryFile}, fetching from GitHub...`);
                reviewSummary = await controller.generateReviewSummaryAndReturn();
              }
            }
          } catch (error) {
            Logger.error(`Failed to load data: ${error}`);
          }

          if (options.prOnly) {
            csvFilePath = await csvExportService.exportPullRequestsToCSV(pullRequests, {
              outputDir,
              filename: `pull_requests_${user}_${startDate}_${endDate}.csv`
            });
          } else if (options.reviewOnly) {
            csvFilePath = await csvExportService.exportReviewSummaryToCSV([reviewSummary], {
              outputDir,
              filename: `review_summary_${user}_${startDate}_${endDate}.csv`
            });
          } else {
            csvFilePath = await csvExportService.exportCombinedToCSV(pullRequests, {
              outputDir,
              filename: `combined_analysis_${user}_${startDate}_${endDate}.csv`
            }, reviewSummary);
          }
        }

        Logger.info("=== CSV Export Completed ===");
        Logger.info(`CSV file: ${csvFilePath}`);
      } catch (error) {
        Logger.error(`CSV export failed: ${error}`);
        process.exit(1);
      }
    });

  // Google Spreadsheet更新コマンド
  program
    .command("update-spreadsheet")
    .description("Update Google Spreadsheet with latest PR data")
    .option("-o, --output <dir>", "Output directory", "./output")
    .option("-s, --start <date>", "Start date (YYYY-MM-DD, default: from env)")
    .option("-e, --end <date>", "End date (YYYY-MM-DD, default: from env)")
    .option("--pr-number <number>", "Specific PR number to add")
    .option("--repository <repo>", "Repository in format owner/name")
    .action(async (options) => {
      try {
        Logger.info("=== Google Spreadsheet Update Started ===");

        // 環境変数から設定を取得
        const githubToken = process.env.GITHUB_TOKEN;
        const googleCredentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
        const sheetId = process.env.GOOGLE_SHEET_ID;
        const repositories = process.env.REPOSITORIES;
        const defaultStartDate = process.env.PERIOD_START_DATE;
        const defaultEndDate = process.env.PERIOD_END_DATE;

        if (!githubToken) {
          throw new Error("GITHUB_TOKEN environment variable is required");
        }
        if (!googleCredentials) {
          throw new Error("GOOGLE_SHEETS_CREDENTIALS environment variable is required");
        }
        if (!sheetId) {
          throw new Error("GOOGLE_SHEET_ID environment variable is required");
        }

        // PR番号とリポジトリが指定された場合の処理
        if (options.prNumber && options.repository) {
          const prNumber = parseInt(options.prNumber);
          const [owner, name] = options.repository.split('/');
          
          if (!owner || !name) {
            throw new Error("Repository must be in format 'owner/name'");
          }

          Logger.info(`Processing specific PR: #${prNumber} from ${options.repository}`);

          // 最小限の設定を作成
          const tempConfig = {
            githubToken,
            userLogin: "temp",
            periodStartDate: "2020-01-01", // 単一PR取得時は使用されない
            periodEndDate: "2030-12-31",   // 単一PR取得時は使用されない
            repositories: [],
            outputDir: options.output || "./output"
          };

          // ConfigManagerにtemporary設定を注入
          const configManager = ConfigManager.getInstance();
          configManager.setConfig(tempConfig);

          // 特定のPRデータを取得
          const controller = new AnalyzerController();
          const pullRequest = await controller.collectSinglePullRequest(owner, name, prNumber);

          Logger.info(`Fetched PR #${prNumber}: ${pullRequest.title}`);

          // Google Sheets サービスを初期化
          const credentials = JSON.parse(googleCredentials);
          const googleSheetsService = new GoogleSheetsService({
            credentials,
            spreadsheetId: sheetId
          });

          // 単一PRデータをスプレッドシートに追加
          await googleSheetsService.appendPullRequestData([pullRequest], 'Sheet1');

          Logger.info("=== Google Spreadsheet Update Completed ===");
          Logger.info(`PR #${prNumber} has been added to the spreadsheet`);
        } else {
          // 期間での全PR取得処理（従来の処理）
          const startDate = options.start || defaultStartDate;
          const endDate = options.end || defaultEndDate;

          if (!startDate || !endDate) {
            throw new Error("Period start and end dates are required when not specifying a specific PR");
          }

          // GitHub Actions環境用の設定を作成
          const tempConfig = {
            githubToken,
            userLogin: "temp", // 全ユーザー取得時は使用されない
            periodStartDate: startDate,
            periodEndDate: endDate,
            repositories: repositories ? repositories.split(',') : [],
            outputDir: options.output || "./output"
          };

          // ConfigManagerにtemporary設定を注入
          const configManager = ConfigManager.getInstance();
          configManager.setConfig(tempConfig);

          Logger.info(`Period: ${startDate} - ${endDate}`);
          Logger.info(`Repositories: ${repositories || 'all'}`);

          // 全ユーザーのプルリクエストデータを取得
          const controller = new AnalyzerController();
          const pullRequests = await controller.collectAllUsersPullRequestsAndReturn();

          Logger.info(`Fetched ${pullRequests.length} pull requests`);

          // Google Sheets サービスを初期化
          const credentials = JSON.parse(googleCredentials);
          const googleSheetsService = new GoogleSheetsService({
            credentials,
            spreadsheetId: sheetId
          });

          // 新しいPRデータのみをスプレッドシートに追加
          await googleSheetsService.appendNewPullRequestData(pullRequests, 'Sheet1');

          Logger.info("=== Google Spreadsheet Update Completed ===");
          Logger.info("New PR data has been added to the spreadsheet");
        }
      } catch (error) {
        Logger.error(`Spreadsheet update failed: ${error}`);
        process.exit(1);
      }
    });

  await program.parseAsync(process.argv);
}

// スクリプトが直接実行された場合のみメイン関数を実行
main().catch((error) => {
  Logger.error(`Unexpected error: ${error}`);
  process.exit(1);
});
