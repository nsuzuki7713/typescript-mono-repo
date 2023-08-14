import { Module } from '@nestjs/common';
import { HelloConsumer } from './hello-kafka.consumer';

@Module({
  providers: [HelloConsumer],
})
export class HelloKafkaModule {}
