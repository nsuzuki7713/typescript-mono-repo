import { Client } from './main';

process.env.LOCAL_TEST = 'http://localhost:4566';

describe('Client', () => {
  let sqsClient: Client;

  beforeAll(async () => {
    const queueName = 'local-test-queue';
    await Client.CreateSqsQueue(queueName);

    sqsClient = new Client(queueName);
  });

  describe('sendMessageToQueue', () => {
    it('メッセージを送信できる', async () => {
      const message = 'send message';

      await sqsClient.sendMessageToQueue(message);

      await expect(sqsClient.receiveMessagesFromQueue()).resolves.toBe(message);
    });
  });

  describe('receiveMessagesFromQueue', () => {
    it.skip('メッセージを受信する', async () => {
      await sqsClient.receiveMessagesFromQueue();

      expect(1).toBe(1);
    });
  });

  describe('createSqsQueue', () => {
    it.skip('キューを作成できる', async () => {
      await Client.CreateSqsQueue('test');

      expect(1).toBe(1);
    });
  });

  describe('listQueues', () => {
    it.skip('キューの一覧を取得できる', async () => {
      await sqsClient.listQueues();

      expect(1).toBe(1);
    });
  });

  describe('getQueueAttributes', () => {
    it('メッセージ数を取得できる', async () => {
      await sqsClient.sendMessageToQueue('test');
      await sqsClient.sendMessageToQueue('test2');

      await expect(sqsClient.getQueueAttributes()).resolves.toBe(2);

      // メッセージを削除する
      await sqsClient.receiveMessagesFromQueue();
    });
  });
});
