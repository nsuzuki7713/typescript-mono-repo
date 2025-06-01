import dotenv from "dotenv";
import path from "path";

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
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): AppConfig {
    const githubToken = process.env.GITHUB_TOKEN;
    const userLogin = process.env.USER_LOGIN;
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
    return { ...this.config };
  }

  public updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}
