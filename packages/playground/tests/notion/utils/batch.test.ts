import { processBatch, splitIntoBatches } from '../../../src/notion/utils/batch';
import { Logger } from '../../../src/notion/utils/logger';

// ロガーのモック化
jest.mock('../../../src/notion/utils/logger', () => ({
  Logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('バッチ処理ユーティリティのテスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('splitIntoBatches', () => {
    test('空の配列を渡した場合は空の配列を返す', () => {
      const result = splitIntoBatches([], 3);
      expect(result).toEqual([]);
    });

    test('バッチサイズより小さい配列を渡した場合は1つのバッチになる', () => {
      const items = [1, 2];
      const result = splitIntoBatches(items, 3);
      expect(result).toEqual([[1, 2]]);
    });

    test('バッチサイズと同じ長さの配列を渡した場合は1つのバッチになる', () => {
      const items = [1, 2, 3];
      const result = splitIntoBatches(items, 3);
      expect(result).toEqual([[1, 2, 3]]);
    });

    test('バッチサイズより大きい配列を渡した場合は複数のバッチに分割される', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8];
      const result = splitIntoBatches(items, 3);
      expect(result).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8],
      ]);
    });
  });

  describe('processBatch', () => {
    test('すべての項目が正常に処理される場合は結果の配列を返す', async () => {
      const items = [1, 2, 3, 4, 5];
      const processor = jest.fn().mockImplementation((item) => Promise.resolve(item * 2));

      const result = await processBatch(items, processor);

      expect(result).toEqual([2, 4, 6, 8, 10]);
      expect(processor).toHaveBeenCalledTimes(items.length);
      expect(Logger.debug).toHaveBeenCalled();
    });

    test('バッチサイズを指定した場合は指定したサイズでバッチ処理される', async () => {
      const items = [1, 2, 3, 4, 5, 6, 7];
      const processor = jest.fn().mockImplementation((item) => Promise.resolve(item * 2));
      const onBatchComplete = jest.fn();

      await processBatch(items, processor, { batchSize: 2, onBatchComplete });

      expect(processor).toHaveBeenCalledTimes(items.length);
      expect(onBatchComplete).toHaveBeenCalledTimes(4); // 7項目を2項目ずつ処理すると4バッチになる
    });

    test('処理中にエラーが発生した場合はonItemErrorが呼び出される', async () => {
      const items = [1, 2, 3, 4, 5];
      const error = new Error('テストエラー');
      const processor = jest.fn().mockImplementation((item) => {
        if (item === 3) {
          return Promise.reject(error);
        }
        return Promise.resolve(item * 2);
      });
      const onItemError = jest.fn();

      await processBatch(items, processor, { onItemError });

      expect(onItemError).toHaveBeenCalledWith(error, 3, 2); // 3番目のアイテム（インデックスは2）でエラー
      expect(processor).toHaveBeenCalledTimes(items.length);
    });

    test('リトライが指定された場合はエラー時にリトライされる', async () => {
      const items = [1];
      let attempts = 0;
      const processor = jest.fn().mockImplementation(() => {
        attempts++;
        if (attempts <= 2) {
          return Promise.reject(new Error('リトライエラー'));
        }
        return Promise.resolve(42);
      });

      const result = await processBatch(items, processor, { retryCount: 2 });

      expect(result).toEqual([42]);
      expect(processor).toHaveBeenCalledTimes(3); // 初回+2回のリトライ
      expect(Logger.warn).toHaveBeenCalledTimes(2); // リトライごとに警告ログ
    });

    test('すべてのリトライが失敗した場合はエラーになる', async () => {
      const items = [1];
      const error = new Error('永続的なエラー');
      const processor = jest.fn().mockImplementation(() => Promise.reject(error));
      const onItemError = jest.fn();

      await processBatch(items, processor, { retryCount: 2, onItemError });

      expect(processor).toHaveBeenCalledTimes(3); // 初回+2回のリトライ
      expect(onItemError).toHaveBeenCalledWith(error, 1, 0);
    });
  });
});
