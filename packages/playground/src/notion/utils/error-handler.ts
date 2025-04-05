/**
 * エラーハンドリングのためのユーティリティ
 */

/**
 * エラーが発生した場合のリトライ処理
 *
 * @param fn 実行する関数
 * @param retryCount リトライ回数
 * @param retryDelay リトライ時の待機時間（ミリ秒）
 * @returns 関数の結果
 * @throws 最大リトライ回数を超えた場合
 */
export async function withRetry<T>(fn: () => Promise<T>, retryCount = 3, retryDelay = 1000): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === retryCount) {
        break;
      }

      console.warn(`エラーが発生しました。${attempt + 1}回目のリトライを行います: ${lastError.message}`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  throw lastError ?? new Error('リトライ処理に失敗しました');
}

/**
 * API操作中のエラーを適切に処理する
 *
 * @param error エラーオブジェクト
 * @param operation 実行中だった操作の説明
 * @param context 追加のコンテキスト情報
 * @throws 元のエラーを拡張したエラー
 */
export function handleApiError(error: unknown, operation: string, context?: Record<string, unknown>): never {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const contextStr = context ? ` (Context: ${JSON.stringify(context)})` : '';

  throw new Error(`${operation}中にエラーが発生しました: ${errorMessage}${contextStr}`);
}

/**
 * GitHub API呼び出し時のエラーハンドリング用ラッパー
 *
 * @param fn 実行する関数
 * @param operation 操作の説明
 * @param context 追加のコンテキスト情報
 * @returns 関数の結果
 * @throws エラーが発生した場合
 */
export async function withGitHubErrorHandling<T>(
  fn: () => Promise<T>,
  operation: string,
  context?: Record<string, unknown>
): Promise<T> {
  try {
    return await withRetry(fn);
  } catch (error) {
    handleApiError(error, `GitHub API (${operation})`, context);
  }
}

/**
 * Notion API呼び出し時のエラーハンドリング用ラッパー
 *
 * @param fn 実行する関数
 * @param operation 操作の説明
 * @param context 追加のコンテキスト情報
 * @returns 関数の結果
 * @throws エラーが発生した場合
 */
export async function withNotionErrorHandling<T>(
  fn: () => Promise<T>,
  operation: string,
  context?: Record<string, unknown>
): Promise<T> {
  try {
    return await withRetry(fn);
  } catch (error) {
    handleApiError(error, `Notion API (${operation})`, context);
  }
}
