#!/usr/bin/env node

import { Command } from "commander";
import dotenv from "dotenv";
import { AnalyzerController } from "./services/analyzerController";
import { ConfigManager, AppConfig } from "./config/config";
import { Logger } from "./utils/logger";

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
    .description("Run full analysis (pull requests + reviews + summary)")
    .action(async () => {
      try {
        const controller = new AnalyzerController();
        await controller.executeFullAnalysis();
      } catch (error) {
        Logger.error(`Analysis failed: ${error}`);
        process.exit(1);
      }
    });

  // プルリクエスト収集コマンド
  program
    .command("pull-requests")
    .description("Collect pull request details only")
    .action(async () => {
      try {
        const controller = new AnalyzerController();
        await controller.collectPullRequestDetails();
      } catch (error) {
        Logger.error(`Pull request collection failed: ${error}`);
        process.exit(1);
      }
    });

  // レビュー収集コマンド
  program
    .command("reviews")
    .description("Collect review summary only")
    .action(async () => {
      try {
        const controller = new AnalyzerController();
        await controller.generateReviewSummary();
      } catch (error) {
        Logger.error(`Review collection failed: ${error}`);
        process.exit(1);
      }
    });

  // サマリー生成コマンド
  program
    .command("summary")
    .description("Generate overall summary from existing PR details file")
    .argument("<pr-details-file>", "Path to PR details JSON file")
    .action(async (prDetailsFile: string) => {
      try {
        const controller = new AnalyzerController();
        await controller.generateOverallSummary(prDetailsFile);
      } catch (error) {
        Logger.error(`Summary generation failed: ${error}`);
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

  await program.parseAsync(process.argv);
}

// スクリプトが直接実行された場合のみメイン関数を実行
main().catch((error) => {
  Logger.error(`Unexpected error: ${error}`);
  process.exit(1);
});

export { AnalyzerController };
