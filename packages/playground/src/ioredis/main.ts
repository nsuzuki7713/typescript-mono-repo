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
   * 引数で指定したキーを削除する。
   *
   * @param key 削除対象のキー
   * @returns 削除できた場合は 1, できなかった場合は 0
   */
  public async delete(key: string): Promise<number> {
    return await this.redis.del(key);
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

  /**
   * コマンドを一括して送信する。
   *
   * @param params キーと値の配列
   */
  public async pipeline(params: { key: string; value: string | Buffer | number }[]): Promise<void> {
    const pipeline = this.redis.pipeline();
    params.forEach((param) => {
      pipeline.set(param.key, param.value);
    });

    await pipeline.exec();
  }

  /**
   * list型を追加する。
   *
   * @param key キー
   * @param value 値
   */
  public async listPush(key: string, value: (string | number | Buffer)[]): Promise<void> {
    await this.redis.rpush(key, ...value);
  }

  /**
   * list型の値を取得する。
   *
   * @param key キー
   * @param start 開始位置
   * @param end 終了位置
   */
  public async getList(key: string, start = 0, end = -1): Promise<string[]> {
    return await this.redis.lrange(key, start, end);
  }

  /**
   * すべてのキーを削除する。
   */
  public async flushall(): Promise<void> {
    await this.redis.flushall();
  }
}
