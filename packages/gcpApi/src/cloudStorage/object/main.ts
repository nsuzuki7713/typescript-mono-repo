import {
  DeleteFilesOptions,
  DownloadOptions,
  FileExistsOptions,
  FileOptions,
  GetFilesOptions,
  GetSignedUrlConfig,
  Storage,
  UploadOptions,
} from '@google-cloud/storage';
import { ExistsOptions } from '@google-cloud/storage/build/src/nodejs-common/service-object';

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
   * @see オブジェクトの命名ガイドライン {@link https://cloud.google.com/storage/docs/naming-objects}
   */
  async uploadFile(filePath: string, options?: UploadOptions) {
    await this.bucket.upload(filePath, options);
  }

  /**
   * メモリからオブジェクトをアップロードする
   *
   * @param fileName ファイル名
   * @param content ファイルのコンテンツ
   * @param options ファイルオプション
   * @see API {@link https://googleapis.dev/nodejs/storage/latest/File.html#save}
   */
  async uploadFromMemory(fileName: string, content: string, options?: FileOptions) {
    await this.bucket.file(fileName, options).save(content);
  }

  /**
   * オブジェクトをダウンロードする
   *
   * @param fileName ファイル名
   * @param options オプション
   * @see API {@link https://googleapis.dev/nodejs/storage/latest/File.html#download}
   */
  async downloadFile(fileName: string, options?: DownloadOptions): Promise<string | undefined> {
    const [file] = await this.bucket.file(fileName).download(options);

    if (options?.destination) {
      return undefined;
    }

    return file.toString();
  }

  /**
   * オブジェクトを一覧を取得する
   *
   * @param query 検索クエリ
   * @see API {@link https://googleapis.dev/nodejs/storage/latest/Bucket.html#getFiles}
   */
  async getFiles(query?: GetFilesOptions) {
    const [files] = await this.bucket.getFiles(query);

    return files;
  }

  /**
   * オブジェクトをコピーする
   *
   * @param srcFileName コピー元のファイル名
   * @param destFileName コピー先のファイル名
   */
  async copyFile(srcFileName: string, destFileName: string) {
    const [file] = await this.bucket.file(srcFileName).copy(destFileName);

    return file;
  }

  /**
   * オブジェクトをrenameする
   *
   * @param srcFileName rename 元のファイル名
   * @param destFileName renameするファイル名
   * @see API {@link https://googleapis.dev/nodejs/storage/latest/File.html#rename}
   */
  async renameFile(srcFileName: string, destFileName: string) {
    const [file] = await this.bucket.file(srcFileName).rename(destFileName);

    return file;
  }

  /**
   * オブジェクトを移動する
   *
   * @param srcFileName
   * @param destFileName
   * @see API {@link https://googleapis.dev/nodejs/storage/latest/File.html#move}
   */
  async moveFile(srcFileName: string, destFileName: string) {
    const [file] = await this.bucket.file(srcFileName).move(destFileName);

    return file;
  }

  /**
   *
   * @param fileName
   */
  async deleteFile(fileName: string) {
    await this.bucket.file(fileName).delete();
  }

  /**
   *
   * @param fileName
   * @see API {@link https://googleapis.dev/nodejs/storage/latest/File.html#getSignedUrl}
   */
  async generateV4ReadSignedUrl(fileName: string) {
    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 1 * 60 * 1000, // 1 minutes
    };

    const [url] = await this.bucket.file(fileName).getSignedUrl(options);

    return url;
  }

  /**
   *
   * @param fileName
   */
  async generateV4UploadSignedUrl(fileName: string) {
    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      contentType: 'text/plain',
    };

    const [url] = await this.bucket.file(fileName).getSignedUrl(options);

    return url;
  }

  /**
   *
   * @param query
   */
  async deleteFiles(query: DeleteFilesOptions) {
    await this.bucket.deleteFiles(query);
  }

  /**
   *
   * @param fileName
   * @param options
   */
  async existsFile(fileName: string, options?: FileExistsOptions) {
    const [exists] = await this.bucket.file(fileName).exists(options);

    return exists;
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
