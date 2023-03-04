import { Client } from './main';

process.env.LOCAL_TEST = 'http://localhost:4566';

describe('Client', () => {
  const sqsClient = new Client();

  describe('sendMessageToQueue', () => {
    it.skip('メッセージを送信できる', async () => {
      await sqsClient.sendMessageToQueue();

      expect(1).toBe(1);
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
      await sqsClient.createSqsQueue();

      expect(1).toBe(1);
    });
  });

  describe('listQueues', () => {
    it('キューの一覧を取得できる', async () => {
      await sqsClient.listQueues();

      expect(1).toBe(1);
    });
  });

  describe('getQueueAttributes', () => {
    it('メッセージ数を取得できる', async () => {
      await sqsClient.getQueueAttributes('http://localhost:4566/000000000000/my-sqs-queue');
      expect(1).toBe(1);
    });
  });
});
