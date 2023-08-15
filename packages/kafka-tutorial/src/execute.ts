import { KafkaService } from './kafka.producer';

async function main() {
  const service = new KafkaService();

  const records = Array.from(Array(100).keys()).map((i) => {
    return {
      key: `key-${i}`,
      value: `value-${i}`,
    };
  });

  // await service.sendNotificationMessage(records);

  for (const record of records) {
    await service.sendNotificationMessage([record]);
  }

  await service.close();
}

main().catch((e) => console.log(e));
