import {
  DeleteFileOptions,
  DeleteFilesOptions,
  DownloadOptions,
  FileExistsOptions,
  FileOptions,
  GetFilesOptions,
  GetSignedUrlConfig,
  Storage,
  UploadOptions,
} from '@google-cloud/storage';

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
   * オブジェクトをダウンロードする。
   * destinationを指定している場合、ローカルに保存する。指定がない場合、オブジェクトの中身を文字列として返す。
   *
   * @param fileName ファイル名
   * @param options オプション
   * @see API {@link https://googleapis.dev/nodejs/storage/latest/File.html#download}
   */
  async downloadFile(fileName: string, options?: DownloadOptions): Promise<string | undefined> {
    // optionsをそのまま渡すとundefinedになってしますのでオブジェクトをコピーして渡す。
    const [file] = await this.bucket.file(fileName).download({ ...options });

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
   * @see API {@link https://googleapis.dev/nodejs/storage/latest/File.html#copy}
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
   * @param srcFileName 移動元のファイル名
   * @param destFileName 移動先のファイル名
   * @see API {@link https://googleapis.dev/nodejs/storage/latest/File.html#move}
   */
  async moveFile(srcFileName: string, destFileName: string) {
    const [file] = await this.bucket.file(srcFileName).move(destFileName);

    return file;
  }

  /**
   * 引数で指定したオブジェクトを削除する
   *
   * @param fileName ファイル名
   * @param options オプション
   * @see API {@link https://googleapis.dev/nodejs/storage/latest/File.html#delete}
   */
  async deleteFile(fileName: string, options?: DeleteFileOptions) {
    await this.bucket.file(fileName).delete(options);
  }

  /**
   * ダウンロード用の署名付きURLを取得する
   *
   * @param fileName ファイル名
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
   * アップロード用の署名付きURLを取得する
   * contentType: 'text/plain' を設定する。
   *
   * @param fileName ファイル名
   * @see API {@link https://googleapis.dev/nodejs/storage/latest/File.html#getSignedUrl}
   */
  async generateV4UploadSignedUrl(fileName: string) {
    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 1 * 60 * 1000, // 1 minutes
      contentType: 'text/plain',
    };

    const [url] = await this.bucket.file(fileName).getSignedUrl(options);

    return url;
  }

  /**
   * 複数のオブジェクトを削除する
   *
   * @param query クエリ
   * @see API {@link https://googleapis.dev/nodejs/storage/latest/Bucket.html#deleteFiles}
   */
  async deleteFiles(query?: DeleteFilesOptions) {
    await this.bucket.deleteFiles(query);
  }

  /**
   * オブジェクトが存在するかの検証をする
   *
   * @param fileName ファイル名
   * @param options オプション
   * @see API {@link https://googleapis.dev/nodejs/storage/latest/File.html#exists}
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
