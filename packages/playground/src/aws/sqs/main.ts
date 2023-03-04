import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  CreateQueueCommand,
  ListQueuesCommand,
  GetQueueAttributesCommand,
} from '@aws-sdk/client-sqs';

function createSQSClient() {
  return new SQSClient({
    ...(process.env.LOCAL_TEST && { endpoint: process.env.LOCAL_TEST }),
  });
}

/**
 *
 */
export class Client {
  private sqsClient: SQSClient;

  constructor(private queueUrl: string) {
    this.sqsClient = createSQSClient();
  }

  /**
   * キューにメッセージを送信する
   *
   * @param message
   */
  async sendMessageToQueue(message: string) {
    const params = {
      QueueUrl: this.queueUrl,
      MessageBody: message,
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
      QueueUrl: this.queueUrl,
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
            QueueUrl: this.queueUrl,
            ReceiptHandle: message.ReceiptHandle,
          });
          await this.sqsClient.send(deleteCommand);
          console.log(`Message deleted`);

          return message.Body;
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
   *
   * @param queueName
   */
  static async CreateSqsQueue(queueName: string): Promise<string | undefined> {
    try {
      const command = new CreateQueueCommand({ QueueName: queueName });
      const response = await createSQSClient().send(command);

      return response.QueueUrl;
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
      throw err;
    }
  }

  /**
   * メッセージの数を取得する。
   *
   * @param queueUrl
   */
  async getQueueAttributes(): Promise<number | undefined> {
    try {
      const command = new GetQueueAttributesCommand({
        QueueUrl: this.queueUrl,
        AttributeNames: ['ApproximateNumberOfMessages'],
      });
      const response = await this.sqsClient.send(command);
      const approxNumOfMessages = response.Attributes?.ApproximateNumberOfMessages;
      console.log(`Approximate number of messages in the queue: ${approxNumOfMessages}`);

      return Number(approxNumOfMessages);
    } catch (err) {
      console.error(err);
    }
  }
}
