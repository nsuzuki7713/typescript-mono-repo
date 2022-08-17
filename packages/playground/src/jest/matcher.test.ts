describe('マッチャー周りの確認', () => {
  describe('toBe', () => {
    it('厳密な等価性を確認する', () => {
      expect(1).toBe(1);
    });
  });

  describe('toEqual', () => {
    it('オブジェクトの値を確認する', () => {
      expect({ a: 1, b: 2 }).toEqual({ a: 1, b: 2 });
    });
  });

  describe('toBeNull', () => {
    it('nullのみに一致する', () => {
      expect(null).toBeNull();
      expect(undefined).not.toBeNull();
      expect(1).not.toBeNull();
    });
  });

  describe('undefined', () => {
    it('undefinedのみに一致する', () => {
      expect(undefined).toBeUndefined();
    });
  });

  describe('toBeDefined', () => {
    it('undefined以外に一致する', () => {
      expect(null).toBeDefined();
      expect(1).toBeDefined();
    });
  });

  describe('toBeTruthy', () => {
    it('Truthyに一致する', () => {
      expect(true).toBeTruthy();
      expect(1).toBeTruthy();
      expect('aaa').toBeTruthy();
      expect({ aa: 123 }).toBeTruthy();
    });
  });

  describe('toBeFalsy', () => {
    it('Falsyに一致する', () => {
      expect(false).toBeFalsy();
      expect(0).toBeFalsy();
      expect('').toBeFalsy();
    });
  });

  describe('toBeGreaterThan', () => {
    it('より大きい値に一致する', () => {
      expect(2).toBeGreaterThan(1);
      expect(2).not.toBeGreaterThan(2);
    });
  });

  describe('toBeGreaterThanOrEqual', () => {
    it('以上に一致する', () => {
      expect(2).toBeGreaterThanOrEqual(1);
      expect(2).toBeGreaterThanOrEqual(2);
    });
  });

  describe('toBeLessThan', () => {
    it('より小さい値に一致する', () => {
      expect(1).toBeLessThan(2);
      expect(2).not.toBeLessThan(2);
    });
  });

  describe('toBeLessThanOrEqual', () => {
    it('以下に一致する', () => {
      expect(1).toBeLessThanOrEqual(2);
      expect(2).toBeLessThanOrEqual(2);
    });
  });

  describe('toMatch', () => {
    it('文字列に対して正規表現でマッチするか確認', () => {
      expect('team').not.toMatch(/I/);
      expect('Christoph').toMatch(/stop/);
    });
  });

  describe('toContain', () => {
    it('配列や反復可能なオブジェクトに特定のアイテムが含まれているかどうかを確認する', () => {
      const shoppingList = ['diapers', 'kleenex', 'trash bags', 'paper towels', 'milk'];

      expect(shoppingList).toContain('milk');
      expect(new Set(shoppingList)).toContain('milk');
    });
  });

  describe('toThrow', () => {
    const compileAndroidCode = () => {
      throw new Error('you are using the wrong JDK');
    };

    it('ある関数が呼び出し時に例外を投げることをテストする', () => {
      expect(() => compileAndroidCode()).toThrow();
      expect(() => compileAndroidCode()).toThrow(Error);

      //エラーメッセージのあ確認もできる
      expect(() => compileAndroidCode()).toThrow('you are using the wrong JDK');
      expect(() => compileAndroidCode()).toThrow(/JDK/);
    });
  });
});
