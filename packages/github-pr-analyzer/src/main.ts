#!/usr/bin/env node

import { Command } from "commander";
import dotenv from "dotenv";
import { AnalyzerController } from "./services/analyzerController";
import { ConfigManager, AppConfig, TeamConfigManager } from "./config/config";
import { Logger } from "./utils/logger";
import { TeamAnalysisService } from "./services/teamAnalysisService";
import { TeamConfig } from "./types/github";

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

  await program.parseAsync(process.argv);
}

// スクリプトが直接実行された場合のみメイン関数を実行
main().catch((error) => {
  Logger.error(`Unexpected error: ${error}`);
  process.exit(1);
});
