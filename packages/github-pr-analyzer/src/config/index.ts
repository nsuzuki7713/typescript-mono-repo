/**
 * 設定ファイルの型定義
 */
export interface Config {
  /** GitHub APIを利用するためのPersonal Access Token */
  githubToken: string;

  /** 分析対象のGitHubユーザー名 */
  userLogin: string;

  /** データ収集期間の開始日 (YYYY-MM-DD) */
  periodStartDate: string;

  /** データ収集期間の終了日 (YYYY-MM-DD) */
  periodEndDate: string;

  /** 分析対象とするリポジトリのリスト (オプション) */
  repositories?: string[];

  /** 生成されたJSONファイルを保存するディレクトリパス */
  outputDir: string;
}

/**
 * デフォルト設定を取得
 */
export function getDefaultConfig(): Partial<Config> {
  return {
    outputDir: "./output",
  };
}

/**
 * 環境変数から設定を読み込み
 */
export function loadConfigFromEnv(): Partial<Config> {
  return {
    githubToken: process.env.GITHUB_TOKEN,
    userLogin: process.env.GITHUB_USER_LOGIN,
    periodStartDate: process.env.PERIOD_START_DATE,
    periodEndDate: process.env.PERIOD_END_DATE,
    repositories: process.env.REPOSITORIES
      ? process.env.REPOSITORIES.split(",").map((repo) => repo.trim())
      : undefined,
    outputDir: process.env.OUTPUT_DIR,
  };
}

/**
 * 設定の妥当性をチェック
 */
export function validateConfig(config: Partial<Config>): config is Config {
  const required = [
    "githubToken",
    "userLogin",
    "periodStartDate",
    "periodEndDate",
    "outputDir",
  ];

  for (const key of required) {
    if (!config[key as keyof Config]) {
      throw new Error(`Required configuration missing: ${key}`);
    }
  }

  // 日付形式のチェック
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(config.periodStartDate!)) {
    throw new Error("periodStartDate must be in YYYY-MM-DD format");
  }
  if (!dateRegex.test(config.periodEndDate!)) {
    throw new Error("periodEndDate must be in YYYY-MM-DD format");
  }

  return true;
}
