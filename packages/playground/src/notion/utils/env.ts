/**
 * 環境変数の検証ユーティリティ
 */

/**
 * 必須の環境変数が設定されているかチェックする
 *
 * @param keys 必須の環境変数キー
 * @throws 必須の環境変数が存在しない場合
 */
export function validateRequiredEnvVars(keys: string[]): void {
  const missingVars: string[] = [];

  for (const key of keys) {
    if (!process.env[key]) {
      missingVars.push(key);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `必須の環境変数が設定されていません: ${missingVars.join(', ')}\n` + '正しく .env ファイルを設定してください。'
    );
  }
}

/**
 * 環境変数を取得する（存在しない場合はエラー）
 *
 * @param key 環境変数キー
 * @returns 環境変数の値
 * @throws 環境変数が存在しない場合
 */
export function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`必須の環境変数 "${key}" が設定されていません。`);
  }
  return value;
}

/**
 * 環境変数を取得する（オプショナル）
 *
 * @param key 環境変数キー
 * @param defaultValue 環境変数が存在しない場合のデフォルト値
 * @returns 環境変数の値またはデフォルト値
 */
export function getEnvVar(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}
