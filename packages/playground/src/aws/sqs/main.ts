import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  CreateQueueCommand,
  ListQueuesCommand,
  GetQueueAttributesCommand,
} from '@aws-sdk/client-sqs';

/**
 *
 */
export class Client {
  private sqsClient: SQSClient;
  private queueUrl = 'testQueue';

  constructor() {
    this.sqsClient = new SQSClient({
      ...(process.env.LOCAL_TEST && { endpoint: process.env.LOCAL_TEST }),
    });
  }

  /**
   * キューにメッセージを送信する
   */
  async sendMessageToQueue() {
    const params = {
      QueueUrl: 'my-sqs-queue',
      MessageBody: 'your-message-body',
    };

    const command = new SendMessageCommand(params);

    try {
      const data = await this.sqsClient.send(command);
      console.log('Message sent to the queue', data);
    } catch (error) {
      console.error('Error sending message to the queue', error);
    }
  }

  /**
   * メッセージを受信して、削除する。
   */
  async receiveMessagesFromQueue() {
    // メッセージ受信コマンドの作成
    const receiveMessageCommand = new ReceiveMessageCommand({
      QueueUrl: 'my-sqs-queue',
      // 一度に受信するメッセージの最大数
      MaxNumberOfMessages: 10,
      // メッセージを処理中にする時間（秒）
      VisibilityTimeout: 60,
    });

    try {
      // メッセージの受信
      const response = await this.sqsClient.send(receiveMessageCommand);

      // 受信したメッセージの処理
      if (response.Messages && response.Messages.length > 0) {
        for (const message of response.Messages) {
          console.log(`Message received: ${message.Body}`);

          // 受信したメッセージを削除する
          const deleteCommand = new DeleteMessageCommand({
            QueueUrl: 'my-sqs-queue',
            ReceiptHandle: message.ReceiptHandle,
          });
          await this.sqsClient.send(deleteCommand);
          console.log(`Message deleted`);
        }
      } else {
        console.log('No messages received from queue.');
      }
    } catch (error) {
      console.log(`Error receiving messages from queue: ${error}`);
    }
  }

  /**
   * キューを作成する
   */
  async createSqsQueue() {
    try {
      const queueName = 'my-sqs-queue';
      const createQueueParams = { QueueName: queueName };
      const command = new CreateQueueCommand(createQueueParams);
      const response = await this.sqsClient.send(command);
      const queueUrl = response.QueueUrl;
      console.log(`SQS queue created with URL: ${queueUrl}`);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * キューの一覧取得する
   */
  async listQueues(): Promise<void> {
    try {
      const command = new ListQueuesCommand({});
      const response = await this.sqsClient.send(command);
      console.log(response.QueueUrls);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * メッセージの数を取得する。
   *
   * @param queueUrl
   */
  async getQueueAttributes(queueUrl: string): Promise<void> {
    try {
      const command = new GetQueueAttributesCommand({
        QueueUrl: queueUrl,
        AttributeNames: ['ApproximateNumberOfMessages'],
      });
      const response = await this.sqsClient.send(command);
      const approxNumOfMessages = response.Attributes?.ApproximateNumberOfMessages;
      console.log(`Approximate number of messages in the queue: ${approxNumOfMessages}`);
    } catch (err) {
      console.error(err);
    }
  }
}
