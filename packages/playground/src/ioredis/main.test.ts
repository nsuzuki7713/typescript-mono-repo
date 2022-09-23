import { RedisClient } from './main';

// redis-server が起動していることを前提
describe('RedisClient', () => {
  let redisClient: RedisClient;

  beforeAll(async () => {
    redisClient = new RedisClient();
  });
  beforeEach(async () => {
    await redisClient.flushall();
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

  describe('pipeline', () => {
    it('コマンドを一括して送信できる', async () => {
      const params = [
        { key: 'pipelineKey1', value: 'pipelineValue1' },
        { key: 'pipelineKey2', value: 'pipelineValue2' },
        { key: 'pipelineKey3', value: 'pipelineValue3' },
      ];

      await redisClient.pipeline(params);

      await expect(redisClient.get('pipelineKey1')).resolves.toBe('pipelineValue1');
      await expect(redisClient.get('pipelineKey2')).resolves.toBe('pipelineValue2');
      await expect(redisClient.get('pipelineKey3')).resolves.toBe('pipelineValue3');
    });
  });

  describe('delete', () => {
    it('キーを指定して、値を削除できる', async () => {
      const key = 'key';
      const value = 'value';
      await redisClient.set(key, value);

      await expect(redisClient.delete(key)).resolves.toBe(1);
      await expect(redisClient.get(key)).resolves.toBeNull();
    });

    it('削除対象のキーが存在しない場合、0を返す', async () => {
      await expect(redisClient.delete('notExistKey')).resolves.toBe(0);
    });
  });

  describe('listPush', () => {
    it('リスト型を作成して値を追加できる', async () => {
      const values = ['value1', 'value2', 'value3'];

      await redisClient.listPush('listKey', values);

      await expect(redisClient.getList('listKey')).resolves.toEqual(values);
    });
  });
});
