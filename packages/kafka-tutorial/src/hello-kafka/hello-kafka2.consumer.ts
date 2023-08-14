import { Injectable } from '@nestjs/common';
import { KafkaMessage } from 'kafkajs';
import { KafkaConsumer } from 'src/kafka.consumer';

@Injectable()
export class Hello2Consumer extends KafkaConsumer {
  readonly consumerGroupName: string;
  readonly consumerTopicName: string;

  constructor() {
    super();
    this.consumerGroupName = 'HelloWorldConsumer';
    this.consumerTopicName = 'TestTopic';
  }

  handler(message: KafkaMessage): void {
    this.logger.log('hello-kafka2');
    this.logger.log(`受信したメッセージ: ${message.value.toString()}`);
  }
}
