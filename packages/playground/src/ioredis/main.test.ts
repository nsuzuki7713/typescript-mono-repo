import { RedisClient } from './main';

describe('RedisClient', () => {
  let redisClient: RedisClient;

  beforeAll(async () => {
    redisClient = new RedisClient();
  });
  afterAll(async () => {
    // Redis へのコネクションを切らないと、Jest が修了しない
    // https://note.com/shift_tech/n/n99b706bede8f
    await redisClient.quit();
  });

  describe('set', () => {
    it('キーと値を指定して、値を設定できる', async () => {
      const key = 'key';
      const value = 'value';

      await redisClient.set(key, value);

      await expect(redisClient.get(key)).resolves.toBe(value);
    });

    it('既に同一キーが設定されている場合、値を上書きする', async () => {
      const key = 'key';
      const value = 'value';
      const newValue = 'newValue';
      await redisClient.set(key, value);

      await redisClient.set(key, newValue);

      await expect(redisClient.get(key)).resolves.toBe(newValue);
    });
  });

  describe('get', () => {
    it('キーが存在しない場合、 null を返す', async () => {
      await expect(redisClient.get('notExistKey')).resolves.toBeNull();
    });

    it('数値で保存した場合、文字列として返す', async () => {
      await redisClient.set('key', 1);

      await expect(redisClient.get('key')).resolves.toBe('1');
    });

    it('Bufferで保存した場合、文字列として返す', async () => {
      await redisClient.set('key', Buffer.from('123'));

      await expect(redisClient.get('key')).resolves.toBe('123');
    });
  });
});
