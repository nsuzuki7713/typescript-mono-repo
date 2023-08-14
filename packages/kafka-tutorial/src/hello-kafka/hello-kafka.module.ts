import { Module } from '@nestjs/common';
import { HelloConsumer } from './hello-kafka.consumer';
import { Hello2Consumer } from './hello-kafka2.consumer';

@Module({
  providers: [HelloConsumer, Hello2Consumer],
})
export class HelloKafkaModule {}
