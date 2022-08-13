import { v4 } from 'uuid';
import { GcpBucket } from '../bucket/main';
import * as fs from 'fs';
import { GcpObject } from './main';
import { DeleteFileOptions, DeleteFilesOptions, GetFilesOptions } from '@google-cloud/storage';

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

  describe.skip('getFiles', () => {
    it.only('オブジェクトの一覧を取得する', async () => {
      const files = await gcpObject.getFiles();

      console.log(files.map((file) => file.name));
      expect(1).toBe(1);
    });

    it.only('検索クエリに応じてオブジェクトの一覧を取得する', async () => {
      const query: GetFilesOptions = {
        prefix: 'aaa/bbb/',
      };
      const files = await gcpObject.getFiles(query);

      console.log(files.map((file) => file.name));
      expect(1).toBe(1);
    });
  });

  describe.skip('copyFile', () => {
    it.only('オブジェクトをコピーする', async () => {
      const srcFileName = 'aaa/bbb/test.json';
      const destFileName = 'aaa/bbb/test2.json';

      await gcpObject.copyFile(srcFileName, destFileName);

      expect(1).toBe(1);
    });
  });

  describe.skip('renameFile', () => {
    it('オブジェクトをリネームする', async () => {
      const srcFileName = 'aaa/bbb/test.json';
      const destFileName = 'aaa/bbb/rename.json';

      await gcpObject.renameFile(srcFileName, destFileName);

      expect(1).toBe(1);
    });
  });

  describe.skip('moveFile', () => {
    it('オブジェクトを移動する', async () => {
      const srcFileName = 'aaa/bbb/test2.json';
      const destFileName = 'aaa/bbb/ccc/move.json';

      await gcpObject.moveFile(srcFileName, destFileName);

      expect(1).toBe(1);
    });
  });

  describe.skip('delete', () => {
    it('オブジェクトを削除する', async () => {
      const fileName = 'aaa/bbb/rename.json';

      await gcpObject.deleteFile(fileName);

      expect(1).toBe(1);
    });
  });

  describe.skip('generateV4ReadSignedUrl', () => {
    it.only('オブジェクトのアップロード用の署名付きURLを生成する', async () => {
      const fileName = 'aaa/bbb/zzz.txt';
      const url = await gcpObject.generateV4ReadSignedUrl(fileName);

      console.log(url);
      expect(1).toBe(1);
    });
  });

  describe.skip('deleteFiles', () => {
    it.only('複数のオブジェクトを削除する', async () => {
      const query: DeleteFilesOptions = {
        prefix: 'aaa/bbb/ccc/',
      };

      await gcpObject.deleteFiles(query);

      expect(1).toBe(1);
    });
  });

  describe('existsFile', () => {
    it.only('オブジェクトが存在する場合、true を返す', async () => {
      const fileName = 'aaa/bbb/ccc.txt';
      const exists = await gcpObject.existsFile(fileName);

      expect(exists).toBe(true);
    });

    it.only('オブジェクトが存在しない場合、false を返す', async () => {
      const fileName = 'not-found.txt';
      const exists = await gcpObject.existsFile(fileName);

      expect(exists).toBe(false);
    });
  });
});
