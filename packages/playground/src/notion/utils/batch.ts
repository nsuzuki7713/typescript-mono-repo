/**
 * バッチ処理のためのユーティリティ
 */
import { Logger } from './logger';

/**
 * 配列を指定されたサイズのバッチに分割する
 *
 * @param array 分割する配列
 * @param batchSize バッチサイズ
 * @returns バッチに分割された配列の配列
 */
export function splitIntoBatches<T>(array: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * 指定されたバッチサイズで並行に処理を実行する
 *
 * @param items 処理する項目の配列
 * @param processor 各項目に対する処理を行う関数
 * @param options バッチ処理のオプション
 * @param options.batchSize
 * @param options.onBatchComplete
 * @param options.onItemError
 * @param options.retryCount
 * @returns 処理結果の配列
 */
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options: {
    batchSize?: number;
    onBatchComplete?: (results: R[], batchIndex: number, totalBatches: number) => void;
    onItemError?: (error: Error, item: T, index: number) => void;
    retryCount?: number;
  } = {}
): Promise<R[]> {
  const { batchSize = 5, onBatchComplete, onItemError, retryCount = 0 } = options;

  const batches = splitIntoBatches(items, batchSize);
  const results: R[] = [];

  Logger.debug(
    `${items.length}個のアイテムを${batches.length}バッチに分割して処理します（バッチサイズ: ${batchSize}）`
  );

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    Logger.debug(`バッチ${batchIndex + 1}/${batches.length}の処理を開始します（${batch.length}アイテム）`);

    const batchPromises = batch.map(async (item, itemIndex) => {
      const index = batchIndex * batchSize + itemIndex;
      try {
        let lastError: Error | null = null;

        // リトライロジック
        for (let attempt = 0; attempt <= retryCount; attempt++) {
          try {
            return await processor(item, index);
          } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            if (attempt === retryCount) {
              break;
            }

            Logger.warn(
              `アイテム[${index}]の処理でエラーが発生しました。${attempt + 1}回目のリトライを行います: ${
                lastError.message
              }`
            );
            await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
          }
        }

        // すべてのリトライが失敗した場合
        if (lastError) {
          if (onItemError) {
            onItemError(lastError, item, index);
          }
          throw lastError;
        }

        // ここには到達しないはずだが、型安全のために
        throw new Error('予期せぬエラーが発生しました');
      } catch (error) {
        if (onItemError) {
          const e = error instanceof Error ? error : new Error(String(error));
          onItemError(e, item, index);
        }
        throw error;
      }
    });

    try {
      // このバッチの全てのプロミスを並行実行
      const batchResults = await Promise.allSettled(batchPromises);

      // 成功した結果のみを抽出
      const successfulResults = batchResults
        .filter((result): result is PromiseFulfilledResult<R> => result.status === 'fulfilled')
        .map((result) => result.value);

      results.push(...successfulResults);

      if (onBatchComplete) {
        onBatchComplete(successfulResults, batchIndex, batches.length);
      }

      Logger.debug(
        `バッチ${batchIndex + 1}/${batches.length}の処理が完了しました（成功: ${successfulResults.length}/${
          batch.length
        }）`
      );
    } catch (error) {
      Logger.error(`バッチ${batchIndex + 1}/${batches.length}の処理中にエラーが発生しました`, error);
    }
  }

  return results;
}
