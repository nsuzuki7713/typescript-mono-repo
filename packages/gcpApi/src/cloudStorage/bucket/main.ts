import { CreateBucketRequest, GetBucketsRequest, Storage } from '@google-cloud/storage';

/**
 * バケット操作に関するクラス
 *
 * @see エラーレスポンス {@link https://cloud.google.com/storage/docs/json_api/v1/status-codes}
 */
export class GcpBucket {
  private readonly storage = new Storage({ keyFilename: './credential.json' });

  /**
   * バケットを新規作成する
   *
   * @param bucketName バケット名
   * @param options オプション
   * @see API {@link https://googleapis.dev/nodejs/storage/latest/Storage.html#createBucket}
   * @see バケットの命名 {@link https://cloud.google.com/storage/docs/naming-buckets}
   * @see バケットの保存場所 {@link https://cloud.google.com/storage/docs/locations}
   * @throws バケット名が重複(コンフリクト)している場合。他の例外は未検証(#GcpBucket のエラードキュメントを参照)
   */
  async createBucket(bucketName: string, options?: CreateBucketRequest) {
    await this.storage.createBucket(bucketName, options);
  }

  /**
   * バケットの一覧を取得する
   *
   * @param options オプション
   * @see API {@link https://googleapis.dev/nodejs/storage/latest/Storage.html#getBuckets}
   */
  async getBuckets(options?: GetBucketsRequest) {
    const [buckets] = await this.storage.getBuckets(options);

    return buckets;
  }

  /**
   * 引数で指定したバケット名に該当するバケットを取得する
   *
   * @param bucketName バケット名
   * @see API {@link https://googleapis.dev/nodejs/storage/latest/Bucket.html#get}
   * @throws 存在しないバケット名の場合。他の例外は未検証(#GcpBucket のエラードキュメントを参照)
   */
  async getBucket(bucketName: string) {
    return this.storage.bucket(bucketName).get();
  }

  /**
   * 引数で指定したバケット名のバケットを削除する
   *
   * @param bucketName バケット名
   * @throws 存在しないバケット名の場合。他の例外は未検証(#GcpBucket のエラードキュメントを参照)
   */
  async deleteBucket(bucketName: string) {
    await this.storage.bucket(bucketName).delete();
  }

  /**
   * 引数で指定したバケット名が存在するかの確認をする
   *
   * @param bucketName バケット名
   */
  async exists(bucketName: string) {
    return this.storage.bucket(bucketName).exists();
  }
}
