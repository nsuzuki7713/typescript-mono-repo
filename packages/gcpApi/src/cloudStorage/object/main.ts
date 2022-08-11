import { Storage, UploadOptions } from '@google-cloud/storage';

/**
 * オブジェクト周りを操作するクラス
 *
 * @see Cloud Storage オブジェクトについて {@link https://cloud.google.com/storage/docs/objects}
 * @see エラーレスポンス {@link https://cloud.google.com/storage/docs/json_api/v1/status-codes}
 */
export class GcpObject {
  private readonly bucket;

  private constructor(storage: Storage, bucketName: string) {
    this.bucket = storage.bucket(bucketName);
  }

  /**
   * ファイルをアップロードする
   *
   * @param filePath アップロードするファイルのローカルパス
   * @param options オプション
   * @see API {@link https://googleapis.dev/nodejs/storage/latest/Bucket.html#upload}
   */
  async uploadFile(filePath: string, options?: UploadOptions) {
    await this.bucket.upload(filePath, options);
  }

  /**
   * GcpObject のインスタンスを生成する
   *
   * @param bucketName バケット名
   */
  static async create(bucketName: string) {
    const storage = new Storage({ keyFilename: `${__dirname}/../../../credential.json` });
    const [exists] = await storage.bucket(bucketName).exists();

    if (!exists) {
      throw new Error('bucket not found');
    }

    return new GcpObject(storage, bucketName);
  }
}
