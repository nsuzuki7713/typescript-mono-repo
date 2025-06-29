import dotenv from "dotenv";
import path from "path";
import { TeamConfig } from "../types/github";

dotenv.config();

export interface AppConfig {
  githubToken: string;
  userLogin: string;
  periodStartDate: string;
  periodEndDate: string;
  repositories?: string[];
  outputDir: string;
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig | null = null;

  private constructor() {
    // 初期化時はバリデーションを実行しない
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): AppConfig {
    const githubToken = process.env.GITHUB_TOKEN;
    const userLogin = process.env.GITHUB_USER_LOGIN;
    const periodStartDate = process.env.PERIOD_START_DATE;
    const periodEndDate = process.env.PERIOD_END_DATE;
    const outputDir = process.env.OUTPUT_DIR || "./output";
    const repositories = process.env.REPOSITORIES
      ? process.env.REPOSITORIES.split(",").map((repo) => repo.trim())
      : undefined;

    if (!githubToken) {
      throw new Error("GITHUB_TOKEN environment variable is required");
    }
    if (!userLogin) {
      throw new Error("USER_LOGIN environment variable is required");
    }
    if (!periodStartDate) {
      throw new Error("PERIOD_START_DATE environment variable is required");
    }
    if (!periodEndDate) {
      throw new Error("PERIOD_END_DATE environment variable is required");
    }

    // Validate date format
    if (
      !this.isValidDate(periodStartDate) ||
      !this.isValidDate(periodEndDate)
    ) {
      throw new Error("Date format should be YYYY-MM-DD");
    }

    return {
      githubToken,
      userLogin,
      periodStartDate,
      periodEndDate,
      repositories,
      outputDir: path.resolve(outputDir),
    };
  }

  private isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  public getConfig(): AppConfig {
    if (!this.config) {
      this.config = this.loadConfig();
    }
    return { ...this.config };
  }

  public updateConfig(updates: Partial<AppConfig>): void {
    if (!this.config) {
      this.config = this.loadConfig();
    }
    this.config = { ...this.config, ...updates };
  }

  public setConfig(config: AppConfig): void {
    this.config = config;
  }
}

/**
 * チーム分析用設定マネージャー
 */
export class TeamConfigManager {
  private static instance: TeamConfigManager;
  private config: TeamConfig | null = null;

  private constructor() {}

  public static getInstance(): TeamConfigManager {
    if (!TeamConfigManager.instance) {
      TeamConfigManager.instance = new TeamConfigManager();
    }
    return TeamConfigManager.instance;
  }

  /**
   * 環境変数からチーム設定を読み込み
   */
  public loadTeamConfig(): TeamConfig {
    const githubToken = process.env.GITHUB_TOKEN;
    const teamName = process.env.TEAM_NAME;
    const teamMembers = process.env.TEAM_MEMBERS;
    const periodStartDate = process.env.PERIOD_START_DATE;
    const periodEndDate = process.env.PERIOD_END_DATE;
    const outputDir = process.env.OUTPUT_DIR || "./output";
    const repositories = process.env.REPOSITORIES
      ? process.env.REPOSITORIES.split(",").map((repo) => repo.trim())
      : undefined;

    if (!githubToken) {
      throw new Error("GITHUB_TOKEN environment variable is required");
    }
    if (!teamMembers) {
      throw new Error(
        "TEAM_MEMBERS environment variable is required (comma-separated list)"
      );
    }
    if (!periodStartDate) {
      throw new Error("PERIOD_START_DATE environment variable is required");
    }
    if (!periodEndDate) {
      throw new Error("PERIOD_END_DATE environment variable is required");
    }

    const teamMembersList = teamMembers
      .split(",")
      .map((member) => member.trim());
    if (teamMembersList.length === 0) {
      throw new Error(
        "At least one team member must be specified in TEAM_MEMBERS"
      );
    }

    // Validate date format
    if (
      !this.isValidDate(periodStartDate) ||
      !this.isValidDate(periodEndDate)
    ) {
      throw new Error("Date format should be YYYY-MM-DD");
    }

    this.config = {
      team_name: teamName,
      team_members: teamMembersList,
      github_token: githubToken,
      period_start_date: periodStartDate,
      period_end_date: periodEndDate,
      repositories,
      output_dir: path.resolve(outputDir),
    };

    return this.config;
  }

  private isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  public getTeamConfig(): TeamConfig {
    if (!this.config) {
      return this.loadTeamConfig();
    }
    return this.config;
  }

  public updateTeamConfig(updates: Partial<TeamConfig>): void {
    if (!this.config) {
      this.loadTeamConfig();
    }
    this.config = { ...this.config!, ...updates };
  }
}
