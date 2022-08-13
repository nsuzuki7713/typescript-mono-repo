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

  describe.skip('uploadFromMemory', () => {
    it('引数で指定した文字列でアップロードする', async () => {
      const content = {
        aa: 123,
        bb: 'test',
      };
      await gcpObject.uploadFromMemory('aaa/bbb/test.json', JSON.stringify(content));

      // @todo: アップロードできたかの検証をする
      expect(1).toBe(1);
    });
  });

  describe.skip('downloadFile', () => {
    it.skip('destination を指定した場合、引数で指定したファイルオブジェクトをダウンロードする', async () => {
      const fileName = 'aaa/bbb/test.json';
      const destination = `${__dirname}/test.json`;
      await gcpObject.downloadFile(fileName, { destination });

      // @todo: アップロードできたかの検証をする
      expect(1).toBe(1);
    });

    it.only('destination を指定しない場合、引数で指定したファイルオブジェクトを文字列として返す', async () => {
      const fileName = 'aaa/bbb/test.json';
      const contents = await gcpObject.downloadFile(fileName);

      console.log(contents);

      // @todo: アップロードできたかの検証をする
      expect(1).toBe(1);
    });
  });
});
