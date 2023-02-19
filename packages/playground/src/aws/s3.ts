import { S3 } from 'aws-sdk';
import * as csvParse from 'fast-csv';

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

  /**
   *
   * @param bucketName
   * @param prefix
   */
  async listObjectsV2(bucketName: string, prefix = '') {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return await this.client.listObjectsV2({ Bucket: bucketName, Prefix: prefix }).promise();
  }

  /**
   *
   * @param fileName
   * @param bucketName
   */
  async downloadCsvFile(bucketName: string, fileName: string): Promise<any> {
    let parseStreamData;
    const params = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Bucket: bucketName,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Key: fileName,
    };
    try {
      const csvReadStream = new S3().getObject(params).createReadStream();
      const csvFileArray: Array<any> = [];
      parseStreamData = new Promise((resolve, reject) => {
        csvParse
          .parseStream(csvReadStream, { headers: true })
          .on('data', function (data) {
            csvFileArray.push(data);
          })
          .on('end', function () {
            resolve(csvFileArray);
          })
          .on('error', function () {
            reject('csv parse process failed');
          });
      });
    } catch (error) {
      console.log(error);
      return [];
    }
    return await parseStreamData;
    // try {
    //   return await parseStreamData;
    // } catch {
    //   return [];
    // }
  }

  /**
   *
   * @param bucketName
   * @param fileName
   */
  async deleteObject(bucketName: string, fileName: string) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    await this.client.deleteObject({ Bucket: bucketName, Key: fileName }).promise();
  }

  /**
   *
   * @param bucketName
   * @param source
   * @param destination
   */
  async copyObject(bucketName: string, source: string, destination: string) {
    return this.client
      .copyObject({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Bucket: bucketName,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        CopySource: `${bucketName}/${source}`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Key: destination,
      })
      .promise();
  }
}
