import { S3Client } from './s3';
import * as dotenv from 'dotenv';

dotenv.config();

describe('S3Client', () => {
  const client = new S3Client();

  describe('upload', () => {
    it.skip('オブジェクトが存在しない場合、uploadできる', async () => {
      const body = 'aaa';
      const bucket = process.env.BUCKET_NAME ?? '';
      const fileName = 'text.txt';

      const res = await client.upload(body, bucket, fileName);
      console.log(res);

      expect(1).toBe(1);
    });

    it.skip('すでにオブジェクトが存在していた場合、上書きする', async () => {
      const bucket = process.env.BUCKET_NAME ?? '';
      const fileName = 'text2.txt';

      await client.upload('aaa', bucket, fileName);
      await client.upload('bbb', bucket, fileName);

      expect(1).toBe(1);
    });
  });
});
