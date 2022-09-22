import Redis from 'ioredis';

/**
 *
 */
export class RedisClient {
  // デフォルトは 127.0.0.1:6379 に接続する
  constructor(private redis = new Redis()) {}

  /**
   * Redis にキーと値を設定する。
   * 既に重複したキーが存在する場合は、上書きする。
   *
   * @param key キー
   * @param value 値
   */
  public async set(key: string, value: string | Buffer | number): Promise<void> {
    await this.redis.set(key, value);
  }

  /**
   * Redis からキーに紐づく値を取得する。
   * キーが存在しない場合は、null を返す。
   *
   * @param key 取得対象のキー
   */
  public async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  /**
   * Redis へのコネクションを切断する。
   */
  public async quit(): Promise<void> {
    await this.redis.quit();
  }
}
