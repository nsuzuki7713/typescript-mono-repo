describe('非同期コードのテスト', () => {
  const fetchData = () => Promise.resolve('peanut butter');
  const fetchDataForError = () => Promise.reject('error');

  describe('Promises', () => {
    it('promiseがresolveされるまで待ってから確認する', () => {
      // テストからpromiseを返すと、Jestはそのpromiseがresolveされるまで待機します。 promiseがrejectされると、テストが失敗します。
      return fetchData().then((data) => {
        expect(data).toBe('peanut butter');
      });
    });
  });

  describe('async/await', () => {
    it('async と awaitをテストで使用することができる', async () => {
      const data = await fetchData();
      expect(data).toBe('peanut butter');
    });

    it('resolvesでも確認できる', async () => {
      await expect(fetchData()).resolves.toBe('peanut butter');
    });

    it('失敗した場合の確認', async () => {
      expect.assertions(1);
      try {
        await fetchDataForError();
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toMatch('error');
      }
    });

    it('rejectでも確認できる', async () => {
      await expect(fetchDataForError()).rejects.toMatch('error');
    });
  });

  describe('callbackでのテスト', () => {
    // eslint-disable-next-line jest/no-done-callback
    it('done() を使用して確認できる', (done) => {
      const fetchData = (cb: (error: Error | null, data: string) => void) => {
        cb(null, 'peanut butter');
      };

      const callback = (error: Error | null, data: string) => {
        if (error) {
          done(error);
          return;
        }
        try {
          expect(data).toBe('peanut butter');
          done();
        } catch (error) {
          done(error);
        }
      };

      fetchData(callback);
    });
  });
});
