import { GoogleSpreadsheetService } from './main';

describe('GoogleSpreadsheetService', () => {
  let spreadService: GoogleSpreadsheetService;

  beforeAll(async () => {
    spreadService = await GoogleSpreadsheetService.getInstance();
  });

  describe.skip('getTitle', () => {
    it('スプレットシートのタイトルを取得できる', async () => {
      expect(spreadService.getTitle()).toBe('nodeからスプレットシートを操作する');
    });
  });

  describe.skip('getRenameTitle', () => {
    afterAll(async () => {
      await spreadService.getRenameTitle('nodeからスプレットシートを操作する');
    });

    it('スプレットシートのタイトルを変更できる', async () => {
      const renameTitle = 'rename Title';

      await spreadService.getRenameTitle(renameTitle);

      expect(spreadService.getTitle()).toBe(renameTitle);
    });
  });

  describe.skip('addSheet', () => {
    beforeAll(async () => {
      await spreadService.deleteSheetByTitle('newSheet');
      await spreadService.deleteSheetByTitle('newSheet2');
      await spreadService.deleteSheetByTitle('newSheet3');
    });

    it('新規シートを追加する', async () => {
      const sheetName = 'newSheet';

      const sheet = await spreadService.addSheet(sheetName);

      expect(sheet.title).toBe(sheetName);
    });

    it('ヘッダーを指定した場合、ヘッダが設定された状態でシートを追加する', async () => {
      const sheetName = 'newSheet2';

      const sheet = await spreadService.addSheet(sheetName, ['name', 'email']);

      expect(sheet.title).toBe(sheetName);
      expect(spreadService.getHeader(sheetName)).toEqual(['name', 'email']);
    });

    it('既に同一名で存在している場合、エラーを返す', async () => {
      const sheetName = 'newSheet3';
      await spreadService.addSheet(sheetName);

      await expect(spreadService.addSheet(sheetName)).rejects.toThrow();
    });
  });

  describe.skip('deleteSheetByTitle', () => {
    it('削除対象のシート名を指定して、シートを削除する', async () => {
      const deleteSheetName = 'deleteSheet';
      await spreadService.addSheet(deleteSheetName);

      await spreadService.deleteSheetByTitle(deleteSheetName);

      expect(spreadService.sheetNames()).not.toContain(deleteSheetName);
    });
  });

  describe.skip('deleteAllSheet', () => {
    // eslint-disable-next-line jest/expect-expect
    it('全てのシートを削除する', async () => {
      // 全部削除すると大変なので、一旦スキップ
      // await spreadService.deleteAllSheet();
      // expect(spreadService.sheetNames()).toEqual([]);
    });
  });

  describe.skip('sheetNames', () => {
    it('シート名の一覧を取得する', async () => {
      const sheetNames = await spreadService.sheetNames();

      expect(sheetNames).toContain('シート1');
    });
  });

  describe.skip('addRow', () => {
    const sheetName = 'addRowSheet';
    const headers = ['header1', 'header2', 'header3'];
    beforeEach(async () => {
      await spreadService.deleteSheetByTitle(sheetName);
      await spreadService.addSheet(sheetName, headers);
    });

    it('引数で配列を設定した場合、その値で行を追加する', async () => {
      const values = ['aaa', 'bbb', 'ddd'];

      await spreadService.addRow(sheetName, values);

      const rows = await spreadService.getRows(sheetName, headers);
      expect(rows[0]).toEqual(values);
    });

    it('引数でオブジェクトを設定した場合、ヘッダーに合うような形で行を追加する', async () => {
      const values = { header2: 'value2', header1: 'value1', header3: 'value3' };

      await spreadService.addRow(sheetName, values);

      const rows = await spreadService.getRows(sheetName, headers);
      expect(rows[0]).toEqual(['value1', 'value2', 'value3']);
    });
  });

  describe.skip('addRows', () => {
    const sheetName = 'addRowsSheet';
    const headers = ['header1', 'header2', 'header3'];
    beforeEach(async () => {
      await spreadService.deleteSheetByTitle(sheetName);
      await spreadService.addSheet(sheetName, headers);
    });

    it('引数で配列を設定した場合、その値で行を追加する', async () => {
      const values = [
        ['aaa', 'bbb', 'dddd'],
        ['eee', 'fff', 'ggg'],
      ];

      await spreadService.addRows(sheetName, values);

      await expect(spreadService.getRows(sheetName, headers)).resolves.toEqual(values);
    });

    it('引数でオブジェクトを設定した場合、ヘッダーに合うような形で行を追加する', async () => {
      const values = [
        { header2: 'value1-2', header1: 'value1-1', header3: 'value1-3' },
        { header2: 'value2-1', header1: 'value2-1', header3: 'value2-3' },
      ];

      await spreadService.addRows(sheetName, values);

      await expect(spreadService.getRows(sheetName, headers)).resolves.toEqual([
        ['value1-1', 'value1-2', 'value1-3'],
        ['value2-1', 'value2-1', 'value2-3'],
      ]);
    });
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  describe.skip('getRows(他のテスト項目で確認しているのでskip)', () => {});

  describe.skip('getHeader', () => {
    const sheetName = 'getHeaderSheet';
    const headers = ['header1', 'header2', 'header3'];
    beforeEach(async () => {
      await spreadService.deleteSheetByTitle(sheetName);
      await spreadService.addSheet(sheetName, headers);
    });

    it('ヘッダーを取得', () => {
      const header = spreadService.getHeader(sheetName);

      expect(header).toEqual(headers);
    });
  });
});
