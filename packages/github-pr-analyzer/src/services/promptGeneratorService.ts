import { FileManager } from "../utils/fileManager";
import { Logger } from "../utils/logger";
import fs from "fs/promises";
import path from "path";

/**
 * プロンプト生成サービス
 * 分析用プロンプトに実際のデータを埋め込んだファイルを生成する
 */
export class PromptGeneratorService {
  /**
   * 個人分析用のプロンプトを生成
   */
  static async generateIndividualAnalysisPrompt(
    username: string,
    startDate: string,
    endDate: string,
    outputDir: string
  ): Promise<string> {
    Logger.info(`Generating analysis prompt for user: ${username}`);

    // データファイルのパスを構築
    const prDetailsFile = path.join(
      outputDir,
      FileManager.generateFilename(
        "created_prs_details",
        username,
        startDate,
        endDate
      )
    );
    const reviewSummaryFile = path.join(
      outputDir,
      FileManager.generateFilename(
        "my_review_summary",
        username,
        startDate,
        endDate
      )
    );
    const overallSummaryFile = path.join(
      outputDir,
      FileManager.generateFilename(
        "overall_summary",
        username,
        startDate,
        endDate
      )
    );
    const repositorySummaryFile = path.join(
      outputDir,
      FileManager.generateFilename(
        "repository_summary",
        username,
        startDate,
        endDate
      )
    );

    // 各データファイルを読み込み
    const [prDetails, reviewSummary, overallSummary, repositorySummary] =
      await Promise.all([
        this.readJsonFileSafely(prDetailsFile),
        this.readJsonFileSafely(reviewSummaryFile),
        this.readJsonFileSafely(overallSummaryFile),
        this.readJsonFileSafely(repositorySummaryFile),
      ]);

    // プロンプトテンプレートを読み込み
    const templatePath = path.join(process.cwd(), "analyzer_prompt.txt");
    const template = await fs.readFile(templatePath, "utf-8");

    // プロンプトを生成
    const prompt = this.buildIndividualAnalysisPrompt(
      template,
      username,
      startDate,
      endDate,
      prDetails,
      reviewSummary,
      overallSummary,
      repositorySummary
    );

    // 生成されたプロンプトを保存
    const outputFilename = `analysis_prompt_${username}_${startDate}-${endDate}.txt`;
    await FileManager.ensureDirectoryExists(outputDir);
    const outputPath = path.join(outputDir, outputFilename);
    await fs.writeFile(outputPath, prompt, "utf-8");

    Logger.info(`Analysis prompt generated: ${outputPath}`);
    return outputPath;
  }

  /**
   * チーム分析用のプロンプトを生成
   */
  static async generateTeamAnalysisPrompt(
    teamName: string,
    startDate: string,
    endDate: string,
    outputDir: string
  ): Promise<string> {
    Logger.info(`Generating team analysis prompt for: ${teamName}`);

    // チームサマリーファイルのパスを構築
    const teamSummaryFile = path.join(
      outputDir,
      `team_summary_${teamName}_${startDate}-${endDate}.json`
    );

    // チームサマリーを読み込み
    const teamSummary = await this.readJsonFileSafely(teamSummaryFile);

    // メンバー詳細ファイルを読み込み
    const memberDetailsMap = new Map();
    if (teamSummary && teamSummary.team_members) {
      for (const member of teamSummary.team_members) {
        const memberFile = path.join(
          outputDir,
          FileManager.generateFilename(
            "team_member_details",
            member,
            startDate,
            endDate
          )
        );
        const memberData = await this.readJsonFileSafely(memberFile);
        if (memberData) {
          memberDetailsMap.set(member, memberData);
        }
      }
    }

    // チーム分析プロンプトテンプレートを読み込み
    const templatePath = path.join(process.cwd(), "team_analyzer_prompt.txt");
    const template = await fs.readFile(templatePath, "utf-8");

    // プロンプトを生成
    const prompt = this.buildTeamAnalysisPrompt(
      template,
      teamName,
      startDate,
      endDate,
      teamSummary,
      memberDetailsMap
    );

    // 生成されたプロンプトを保存
    const outputFilename = `team_analysis_prompt_${teamName}_${startDate}-${endDate}.txt`;
    await FileManager.ensureDirectoryExists(outputDir);
    const outputPath = path.join(outputDir, outputFilename);
    await fs.writeFile(outputPath, prompt, "utf-8");

    Logger.info(`Team analysis prompt generated: ${outputPath}`);
    return outputPath;
  }

  /**
   * 個人分析プロンプトを構築
   */
  private static buildIndividualAnalysisPrompt(
    template: string,
    username: string,
    startDate: string,
    endDate: string,
    prDetails: any,
    reviewSummary: any,
    overallSummary: any,
    repositorySummary: any
  ): string {
    let prompt = template;

    // ヘッダー部分を更新
    prompt = prompt.replace(
      /# GitHub PR Analyzer 結果分析プロンプト/,
      `# GitHub PR Analyzer 結果分析プロンプト - ${username} (${startDate} ～ ${endDate})`
    );

    // データセクションを構築
    const dataSection = this.buildDataSection(
      prDetails,
      reviewSummary,
      overallSummary,
      repositorySummary
    );

    // "## 分析対象データファイル"セクションを置換
    const dataSectionStart = prompt.indexOf("## 分析対象データファイル");
    const analysisPointsStart = prompt.indexOf("## 分析観点");

    if (dataSectionStart !== -1 && analysisPointsStart !== -1) {
      const beforeDataSection = prompt.substring(0, dataSectionStart);
      const afterDataSection = prompt.substring(analysisPointsStart);

      prompt =
        beforeDataSection +
        "## 分析対象データ\n\n" +
        dataSection +
        "\n\n" +
        afterDataSection;
    }

    return prompt;
  }

  /**
   * チーム分析プロンプトを構築
   */
  private static buildTeamAnalysisPrompt(
    template: string,
    teamName: string,
    startDate: string,
    endDate: string,
    teamSummary: any,
    memberDetailsMap: Map<string, any>
  ): string {
    let prompt = template;

    // ヘッダー部分を更新
    prompt = prompt.replace(
      /# GitHub PR Analyzer チーム分析結果 分析プロンプト/,
      `# GitHub PR Analyzer チーム分析結果 分析プロンプト - ${teamName} (${startDate} ～ ${endDate})`
    );

    // データセクションを構築
    const teamDataSection = this.buildTeamDataSection(
      teamSummary,
      memberDetailsMap
    );

    // "## 分析対象データファイル"セクションを置換
    const dataSectionStart = prompt.indexOf("## 分析対象データファイル");
    const analysisPointsStart = prompt.indexOf("## チーム分析観点");

    if (dataSectionStart !== -1 && analysisPointsStart !== -1) {
      const beforeDataSection = prompt.substring(0, dataSectionStart);
      const afterDataSection = prompt.substring(analysisPointsStart);

      prompt =
        beforeDataSection +
        "## 分析対象データ\n\n" +
        teamDataSection +
        "\n\n" +
        afterDataSection;
    }

    return prompt;
  }

  /**
   * 個人分析用データセクションを構築
   */
  private static buildDataSection(
    prDetails: any,
    reviewSummary: any,
    overallSummary: any,
    repositorySummary: any
  ): string {
    let dataSection = "";

    // 1. プルリクエスト詳細データ
    if (prDetails && Array.isArray(prDetails)) {
      dataSection += "### 1. プルリクエスト詳細データ\n\n";
      dataSection += "```json\n";
      dataSection += JSON.stringify(prDetails, null, 2);
      dataSection += "\n```\n\n";
    }

    // 2. レビューサマリー
    if (reviewSummary) {
      dataSection += "### 2. レビューサマリー\n\n";
      dataSection += "```json\n";
      dataSection += JSON.stringify(reviewSummary, null, 2);
      dataSection += "\n```\n\n";
    }

    // 3. 全体サマリー
    if (overallSummary) {
      dataSection += "### 3. 全体サマリー\n\n";
      dataSection += "```json\n";
      dataSection += JSON.stringify(overallSummary, null, 2);
      dataSection += "\n```\n\n";
    }

    // 4. リポジトリサマリー
    if (repositorySummary) {
      dataSection += "### 4. リポジトリサマリー\n\n";
      dataSection += "```json\n";
      dataSection += JSON.stringify(repositorySummary, null, 2);
      dataSection += "\n```\n\n";
    }

    return dataSection;
  }

  /**
   * チーム分析用データセクションを構築
   */
  private static buildTeamDataSection(
    teamSummary: any,
    memberDetailsMap: Map<string, any>
  ): string {
    let dataSection = "";

    // 1. チームサマリー
    if (teamSummary) {
      dataSection += "### 1. チームサマリー\n\n";
      dataSection += "```json\n";
      dataSection += JSON.stringify(teamSummary, null, 2);
      dataSection += "\n```\n\n";
    }

    // 2. メンバー詳細データ
    if (memberDetailsMap.size > 0) {
      dataSection += "### 2. メンバー詳細データ\n\n";
      for (const [member, memberData] of memberDetailsMap) {
        dataSection += `#### ${member}\n\n`;
        dataSection += "```json\n";
        dataSection += JSON.stringify(memberData, null, 2);
        dataSection += "\n```\n\n";
      }
    }

    return dataSection;
  }

  /**
   * JSONファイルを安全に読み込み（ファイルが存在しない場合はnullを返す）
   */
  private static async readJsonFileSafely(filePath: string): Promise<any> {
    try {
      await fs.access(filePath);
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      Logger.warn(`File not found or unable to read: ${filePath}`);
      return null;
    }
  }
}
