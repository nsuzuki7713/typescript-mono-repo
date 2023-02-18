import { S3 } from 'aws-sdk';

/**
 * v2でS3を操作するクラス
 */
export class S3Client {
  private client;
  constructor() {
    this.client = new S3();
  }

  /**
   * オブジェクトをuploadする。
   * 既にオブジェクトが存在している場合は上書きする。
   *
   * @param body オブジェクトのコンテンツ
   * @param bucket バケット名
   * @param fileName オブジェクト名
   */
  async upload(body: string, bucket: string, fileName: string) {
    const params: S3.PutObjectRequest = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Body: body,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Bucket: bucket,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Key: fileName,
    };

    try {
      const res = await this.client.upload(params).promise();
      return res;
    } catch (e) {
      console.log(e);
    }
  }
}
