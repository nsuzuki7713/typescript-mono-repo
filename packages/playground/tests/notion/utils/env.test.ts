import { getEnvVar, getRequiredEnvVar, validateRequiredEnvVars } from '../../../src/notion/utils/env';

describe('環境変数ユーティリティのテスト', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // テスト用に環境変数をクリア
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // テスト後に環境変数を元に戻す
    process.env = originalEnv;
  });

  describe('validateRequiredEnvVars', () => {
    test('すべての必須環境変数が存在する場合はエラーを投げない', () => {
      // 準備
      process.env.TEST_VAR1 = 'value1';
      process.env.TEST_VAR2 = 'value2';

      // 実行と検証
      expect(() => validateRequiredEnvVars(['TEST_VAR1', 'TEST_VAR2'])).not.toThrow();
    });

    test('必須環境変数が存在しない場合はエラーを投げる', () => {
      // 準備
      process.env.TEST_VAR1 = 'value1';

      // 実行と検証
      expect(() => validateRequiredEnvVars(['TEST_VAR1', 'MISSING_VAR'])).toThrow(
        '必須の環境変数が設定されていません: MISSING_VAR'
      );
    });

    test('複数の必須環境変数が存在しない場合はすべてエラーメッセージに含まれる', () => {
      // 実行と検証
      expect(() => validateRequiredEnvVars(['MISSING_VAR1', 'MISSING_VAR2'])).toThrow(
        '必須の環境変数が設定されていません: MISSING_VAR1, MISSING_VAR2'
      );
    });
  });

  describe('getRequiredEnvVar', () => {
    test('環境変数が存在する場合はその値を返す', () => {
      // 準備
      const expectedValue = 'test-value';
      process.env.TEST_VAR = expectedValue;

      // 実行
      const result = getRequiredEnvVar('TEST_VAR');

      // 検証
      expect(result).toBe(expectedValue);
    });

    test('環境変数が存在しない場合はエラーを投げる', () => {
      // 実行と検証
      expect(() => getRequiredEnvVar('MISSING_VAR')).toThrow('必須の環境変数 "MISSING_VAR" が設定されていません。');
    });
  });

  describe('getEnvVar', () => {
    test('環境変数が存在する場合はその値を返す', () => {
      // 準備
      const expectedValue = 'test-value';
      process.env.TEST_VAR = expectedValue;

      // 実行
      const result = getEnvVar('TEST_VAR', 'default-value');

      // 検証
      expect(result).toBe(expectedValue);
    });

    test('環境変数が存在しない場合はデフォルト値を返す', () => {
      // 準備
      const defaultValue = 'default-value';

      // 実行
      const result = getEnvVar('MISSING_VAR', defaultValue);

      // 検証
      expect(result).toBe(defaultValue);
    });
  });
});
