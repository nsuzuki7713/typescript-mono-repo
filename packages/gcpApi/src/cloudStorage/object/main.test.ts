import { GcpBucket } from '../bucket/main';
import * as fs from 'fs';
import { GcpObject } from './main';
import { DeleteFilesOptions, GetFilesOptions } from '@google-cloud/storage';

describe('GcpObject', () => {
  const bucketName = `test-gcp-object`;
  const gcpBucket = new GcpBucket();
  let gcpObject: GcpObject;

  beforeAll(async () => {
    const [exists] = await gcpBucket.exists(bucketName);

    if (exists) {
      gcpObject = await GcpObject.create(bucketName);
      await gcpObject.deleteFiles();
      return;
    }

    await gcpBucket.createBucket(bucketName, { location: 'asia-northeast1' });
    gcpObject = await GcpObject.create(bucketName);
  });

  afterAll(async () => {
    await gcpObject.deleteFiles();
    await gcpBucket.deleteBucket(bucketName);
  });

  describe.skip('uploadFile', () => {
    const filePath = `${__dirname}/test.txt`;

    beforeAll(() => {
      fs.writeFileSync(filePath, 'test');
    });

    afterAll(async () => {
      fs.unlinkSync(filePath);
    });

    it('ファイルを保存する場所を指定してアップロードできる', async () => {
      const destination = 'uploadFile/test.txt';
      await gcpObject.uploadFile(filePath, { destination });

      await expect(gcpObject.existsFile(destination)).resolves.toBe(true);
    });
  });

  describe.skip('uploadFromMemory', () => {
    it('引数で指定した文字列でアップロードする', async () => {
      const fileName = 'uploadFromMemory/a.json';
      const content = {
        aa: 123,
        bb: 'test',
      };

      await gcpObject.uploadFromMemory(fileName, JSON.stringify(content));

      await expect(gcpObject.downloadFile(fileName)).resolves.toBe(JSON.stringify(content));
    });

    it('既にオブジェクトが存在していた場合、上書きする', async () => {
      const fileName = 'uploadFromMemory/b.json';
      const content = {
        aa: 123,
        bb: 'test',
      };
      await gcpObject.uploadFromMemory(fileName, JSON.stringify(content));

      await gcpObject.uploadFromMemory(fileName, 'Overwrite test');

      await expect(gcpObject.downloadFile(fileName)).resolves.toBe('Overwrite test');
    });
  });

  describe.skip('downloadFile', () => {
    const fileName = 'downloadFile/a.txt';
    const content = 'download file';

    beforeAll(async () => {
      await gcpObject.uploadFromMemory(fileName, content);
    });

    it('destination を指定した場合、引数で指定したファイルオブジェクトをダウンロードする', async () => {
      const destination = `${__dirname}/a.txt`;

      await gcpObject.downloadFile(fileName, { destination });

      const body = fs.readFileSync(destination);
      expect(body.toString()).toBe(content);

      // 作成したファイルを削除する
      fs.unlinkSync(destination);
    });

    it('destination を指定しない場合、引数で指定したファイルオブジェクトを文字列として返す', async () => {
      await expect(gcpObject.downloadFile(fileName)).resolves.toBe(content);
    });

    it('存在しないオブジェクトの場合、エラーになる', async () => {
      await expect(gcpObject.downloadFile('downloadFile/not-found.txt')).rejects.toThrow();
    });
  });

  describe.skip('getFiles', () => {
    const fileNames = ['getFiles/1/a.txt', 'getFiles/1/b.txt', 'getFiles/2/a.txt'];
    beforeAll(async () => {
      await Promise.all(fileNames.map((fileName) => gcpObject.uploadFromMemory(fileName, 'getFiles')));
    });

    it('オブジェクトの一覧を取得する', async () => {
      const files = await gcpObject.getFiles();

      expect(files.map((file) => file.name)).toEqual(expect.arrayContaining(fileNames));
    });

    it('検索クエリに応じてオブジェクトの一覧を取得する', async () => {
      const query: GetFilesOptions = {
        prefix: 'getFiles/',
      };
      const files = await gcpObject.getFiles(query);

      expect(files.map((file) => file.name)).toEqual(fileNames);
    });
  });

  describe.skip('copyFile', () => {
    const fileName = 'copyFile/test.txt';
    beforeAll(async () => {
      await gcpObject.uploadFromMemory(fileName, 'copyFile');
    });

    it('オブジェクトをコピーする', async () => {
      const destFileName = 'copyFile/copy.txt';

      await gcpObject.copyFile(fileName, destFileName);

      await expect(gcpObject.existsFile(fileName)).resolves.toBe(true);
      await expect(gcpObject.existsFile(destFileName)).resolves.toBe(true);
    });

    it('存在しないオブジェクトの場合、エラーになる', async () => {
      await expect(gcpObject.copyFile('copy/not-found.txt', 'not-found.txt')).rejects.toThrow();
    });
  });

  describe.skip('renameFile', () => {
    const fileName = 'renameFile/test.txt';
    beforeAll(async () => {
      await gcpObject.uploadFromMemory(fileName, 'renameFile');
    });

    it('オブジェクトをリネームする', async () => {
      const destFileName = 'renameFile/rename.txt';

      await gcpObject.renameFile(fileName, destFileName);

      await expect(gcpObject.existsFile(fileName)).resolves.toBe(false);
      await expect(gcpObject.existsFile(destFileName)).resolves.toBe(true);
    });

    it('存在しないオブジェクトの場合、エラーになる', async () => {
      await expect(gcpObject.renameFile('rename/not-found.txt', 'not-found.txt')).rejects.toThrow();
    });
  });

  describe.skip('moveFile', () => {
    const fileName = 'moveFile/test.txt';
    beforeAll(async () => {
      await gcpObject.uploadFromMemory(fileName, 'moveFile');
    });

    it('オブジェクトを移動する', async () => {
      const destFileName = 'moveFile/move/test.txt';

      await gcpObject.moveFile(fileName, destFileName);

      await expect(gcpObject.existsFile(fileName)).resolves.toBe(false);
      await expect(gcpObject.existsFile(destFileName)).resolves.toBe(true);
    });

    it('存在しないオブジェクトの場合、エラーになる', async () => {
      await expect(gcpObject.moveFile('moveFile/not-found.txt', 'not-found.txt')).rejects.toThrow();
    });
  });

  describe.skip('generateV4ReadSignedUrl', () => {
    const fileName = 'generateV4ReadSignedUrl/test.txt';
    const body = 'generate-v4-read-signed-url';
    beforeAll(async () => {
      await gcpObject.uploadFromMemory(fileName, body);
    });

    it('オブジェクトのアップロード用の署名付きURLを生成する', async () => {
      const url = await gcpObject.generateV4ReadSignedUrl(fileName);

      const res = await fetch(url);

      await expect(res.text()).resolves.toBe(body);
    });
  });

  describe('generateV4WriteSignedUrl', () => {
    // 署名付きURLのアップロード方法がわからない。
    it.skip('アップロード用の署名付きURLを生成する', async () => {
      const uploadFileName = 'generateV4ReadSignedUrl/upload.txt';
      const url = await gcpObject.generateV4UploadSignedUrl(uploadFileName);

      const requestOptions: RequestInit = {
        method: 'POST',
        body: 'upload',
        headers: {
          'Content-Type': 'text/plain',
        },
      };
      await fetch(url, requestOptions);

      await expect(gcpObject.existsFile(uploadFileName)).resolves.toBe(true);
    });
  });

  describe.skip('delete', () => {
    it('オブジェクトを削除する', async () => {
      const fileName = 'delete/txt.txt';
      await gcpObject.uploadFromMemory(fileName, 'delete');

      await gcpObject.deleteFile(fileName);

      const exists = await gcpObject.existsFile(fileName);
      expect(exists).toBe(false);
    });

    describe('ignoreNotFoundのオプション', () => {
      describe('falseにした場合', () => {
        it('存在しないオブジェクトを指定した場合はエラーになる', async () => {
          await expect(gcpObject.deleteFile('delete/not-found.txt', { ignoreNotFound: false })).rejects.toThrow();
        });
      });

      describe('trueにした場合', () => {
        it('存在しないオブジェクトを指定した場合はエラーにならない', async () => {
          await expect(gcpObject.deleteFile('delete/not-found.txt', { ignoreNotFound: true })).resolves.toBeUndefined();
        });
      });
    });
  });

  describe.skip('deleteFiles', () => {
    const fileNames = ['deleteFiles/1/a.txt', 'deleteFiles/1/b.txt', 'deleteFiles/2/a.txt'];
    beforeAll(async () => {
      await Promise.all(fileNames.map((fileName) => gcpObject.uploadFromMemory(fileName, 'deleteFiles')));
    });

    it('複数のオブジェクトを削除する', async () => {
      const query: DeleteFilesOptions = {
        prefix: 'deleteFiles/1',
      };

      await gcpObject.deleteFiles(query);

      const files = await gcpObject.getFiles({ prefix: 'deleteFiles/' });
      expect(files.map((file) => file.name)).toEqual(['deleteFiles/2/a.txt']);
    });
  });

  describe.skip('existsFile', () => {
    const fileName = 'existsFile.txt';
    beforeAll(async () => {
      await gcpObject.uploadFromMemory(fileName, 'existsFile');
    });

    it('オブジェクトが存在する場合、true を返す', async () => {
      const exists = await gcpObject.existsFile(fileName);

      expect(exists).toBe(true);
    });

    it('オブジェクトが存在しない場合、false を返す', async () => {
      const exists = await gcpObject.existsFile('not-found.txt');

      expect(exists).toBe(false);
    });
  });
});
