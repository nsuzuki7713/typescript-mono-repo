import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer, ProducerRecord } from 'kafkajs';

/**
 * Kafkaで扱うサービス
 */
@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka | null = null;
  private producer: Producer | null = null;

  /**
   * アプリケーションが起動し、DIコンテナが各モジュールとプロバイダーを構築した直後に行われる初期化処理
   */
  async onModuleInit() {
    this.kafka = new Kafka({
      clientId: 'test-client',
      brokers: process.env['BROKER_ENDPOINTS']?.split(',') ?? [
        'localhost:9093',
      ],
    });

    this.producer = this.kafka.producer();
    await this.producer.connect();
  }

  /**
   * アプリケーションが終了する前に行われる終了処理
   */
  async onModuleDestroy() {
    if (!this.producer) {
      return;
    }
    await this.producer.disconnect();
  }

  /**
   * 通知メッセージ用のメッセージを送る
   *
   * @param params 送信するメッセージの内容。このオブジェクトをJSON.Stringifyしたものが送られる。
   */
  async sendNotificationMessage(
    records: {
      key: string;
      value: string;
    }[],
  ) {
    if (!this.producer) {
      await this.onModuleInit();
    }

    const record: ProducerRecord = {
      topic: 'TestTopic',
      // TODO: kafkaでは複数のメッセージをまとめて送ることができるようにする
      messages: records.map((record) => ({
        // key: record.key,
        value: record.value,
      })),
    };

    await this.producer.send(record);
  }

  async close() {
    this.producer.disconnect();
  }
}
