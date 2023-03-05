import { KinesisClient } from './main';
describe('KinesisClient', () => {
  const kinesisClient = new KinesisClient('data-stream-sample');
  describe('putRecord', () => {
    it.skip('レコードを送信できる', async () => {
      await kinesisClient.putRecord({ test: 'aaa' });

      expect(1).toBe(1);
    });
  });

  describe('getRecords', () => {
    it.skip('レコードを取得できる', async () => {
      await kinesisClient.getRecords();

      expect(1).toBe(1);
    });
  });
});
