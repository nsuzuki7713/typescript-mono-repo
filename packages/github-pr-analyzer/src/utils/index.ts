import * as fs from "fs";
import * as path from "path";

/**
 * ディレクトリが存在しない場合は作成
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * JSONファイルに保存
 */
export function saveJsonFile(filePath: string, data: any): void {
  const dirPath = path.dirname(filePath);
  ensureDirectoryExists(dirPath);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`Data saved to: ${filePath}`);
}

/**
 * JSONファイルを読み込み
 */
export function loadJsonFile<T>(filePath: string): T {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as T;
}

/**
 * 2つの日時の差を時間単位で計算
 */
export function calculateHoursDifference(
  startDate: string,
  endDate: string
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  return diffMs / (1000 * 60 * 60); // ミリ秒を時間に変換
}

/**
 * ファイル名生成用のユーティリティ
 */
export function generateFileName(
  prefix: string,
  userLogin: string,
  startDate: string,
  endDate: string,
  extension: string = "json"
): string {
  return `${prefix}_${userLogin}_${startDate}-${endDate}.${extension}`;
}

/**
 * 日付文字列の妥当性をチェック
 */
export function isValidDateString(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  return date.toISOString().slice(0, 10) === dateString;
}

/**
 * ログ出力用のユーティリティ
 */
export function log(
  message: string,
  level: "info" | "warn" | "error" = "info"
): void {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] ${level.toUpperCase()}:`;

  switch (level) {
    case "error":
      console.error(prefix, message);
      break;
    case "warn":
      console.warn(prefix, message);
      break;
    default:
      console.log(prefix, message);
  }
}
