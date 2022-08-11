import { v4 } from 'uuid';
import { GcpBucket } from '../bucket/main';
import * as fs from 'fs';
import { GcpObject } from './main';

describe('GcpObject', () => {
  const gcpBucket = new GcpBucket();
  let gcpObject: GcpObject;
  // const bucketName = `test-gcpObject-${v4()}`;
  const bucketName = `test-gcp-object-test`;

  beforeAll(async () => {
    // await gcpBucket.createBucket(bucketName);
    gcpObject = await GcpObject.create(bucketName);
  });

  // beforeAll(async () => {
  //   await gcpBucket.deleteBucket(bucketName);
  // });

  describe.skip('uploadFile', () => {
    const filePath = `${__dirname}/test.txt`;

    beforeAll(() => {
      fs.writeFileSync(filePath, 'test');
    });

    afterAll(async () => {
      fs.unlinkSync(filePath);
    });

    it('引数で指定したファイルパスのものをアップロードできる', async () => {
      await gcpObject.uploadFile(filePath);

      // @todo: アップロードできたかの検証をする
      expect(1).toBe(1);
    });

    it('ファイルを保存する場所を指定してアップロードできる', async () => {
      await gcpObject.uploadFile(filePath, { destination: 'aaa/bbb/ccc.txt' });

      // @todo: アップロードできたかの検証をする
      expect(1).toBe(1);
    });

    it('gzipしてアップロードできる', async () => {
      await gcpObject.uploadFile(filePath, { destination: 'aaa/bbb/ddd.txt', gzip: true });

      // @todo: アップロードできたかの検証をする
      expect(1).toBe(1);
    });
  });
});
