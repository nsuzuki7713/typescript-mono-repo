import {
  GetRecordsCommand,
  GetShardIteratorCommand,
  KinesisClient as KinesisClientSdk,
  PutRecordCommand,
  PutRecordInput,
} from '@aws-sdk/client-kinesis';
import { v4 as uuidv4 } from 'uuid';

/**
 *
 */
export class KinesisClient {
  private kinesisClient: KinesisClientSdk;

  constructor(private streamName: string) {
    this.kinesisClient = new KinesisClientSdk({
      ...(process.env.LOCAL_TEST && { endpoint: process.env.LOCAL_TEST }),
    });
  }

  /**
   *
   * @param data
   */
  async putRecord(data: object) {
    const putRecordInput: PutRecordInput = {
      StreamName: this.streamName,
      PartitionKey: uuidv4(),
      Data: new TextEncoder().encode(JSON.stringify(data)),
    };

    // Kinesisストリームにデータを書き込む
    const res = await this.kinesisClient.send(new PutRecordCommand(putRecordInput));

    console.log(res);
  }

  /**
   *
   */
  async getRecords() {
    const shardId = 'shardId-000000000003';
    // 最初のレコードを取得するためのシャードイテレーターを取得する
    const getShardIteratorCommand = new GetShardIteratorCommand({
      StreamName: this.streamName,
      ShardId: shardId,
      ShardIteratorType: 'AT_TIMESTAMP', // 最も古いレコードから取得する
      Timestamp: new Date('2023/03/05 13:57:00'),
    });

    const res = await this.kinesisClient.send(getShardIteratorCommand);

    const shardIterator = res.ShardIterator;

    console.log(shardIterator);

    // シャードイテレーターを使用して、Kinesisストリームからレコードを取得する
    const getRecordsCommand = new GetRecordsCommand({ ShardIterator: shardIterator });

    const res2 = await this.kinesisClient.send(getRecordsCommand);

    console.log(res2);

    for (const record of res2.Records ?? []) {
      const decoder = new TextDecoder('utf-8');
      console.log(decoder.decode(record.Data));
    }
  }
}
