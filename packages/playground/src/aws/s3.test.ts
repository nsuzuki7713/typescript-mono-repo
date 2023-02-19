import { S3Client } from './s3';
import * as dotenv from 'dotenv';

dotenv.config();

describe('S3Client', () => {
  const client = new S3Client();
  const bucket = process.env.BUCKET_NAME ?? '';

  describe('upload', () => {
    it.skip('オブジェクトが存在しない場合、uploadできる', async () => {
      const body = 'aaa';
      const fileName = 'text.txt';

      const res = await client.upload(body, bucket, fileName);
      console.log(res);

      expect(1).toBe(1);
    });

    it.skip('すでにオブジェクトが存在していた場合、上書きする', async () => {
      const fileName = 'text2.txt';
      await client.upload('aaa', bucket, fileName);
      await client.upload('bbb', bucket, fileName);

      expect(1).toBe(1);
    });
  });

  describe('listObjectsV2', () => {
    it.skip('prefixを指定してない場合、全オブジェクトの情報を取得する', async () => {
      const res = await client.listObjectsV2(bucket);

      console.log(res);
      expect(1).toBe(1);
    });
  });

  describe('downloadCsvFile', () => {
    it.skip('prefixを指定してない場合、全オブジェクトの情報を取得する', async () => {
      const res = await client.downloadCsvFile(bucket, 'abc.csv');

      console.log(res);
      expect(1).toBe(1);
    });
  });

  describe('deleteObject', () => {
    it.skip('ファイルを削除する', async () => {
      await client.deleteObject(bucket, 'abc.csv');

      expect(1).toBe(1);
    });
  });

  describe('copyObject', () => {
    it.skip('オブジェクトをコピーできる', async () => {
      await client.copyObject(bucket, 'text.txt', 'copy/test.csv');

      expect(1).toBe(1);
    });

    it.skip('既にコピー先にファイルが存在している場合は上書きする', async () => {
      await client.copyObject(bucket, 'text2.txt', 'copy/test.csv');
      await client.copyObject(bucket, 'text.txt', 'copy/test.csv');
      expect(1).toBe(1);
    });

    it.skip('コピー元のオブジェクトが存在しない場合はエラーになる', async () => {
      await expect(client.copyObject(bucket, 'not-found.txt', 'copy/test.csv')).rejects.toThrow();
    });
  });
});
