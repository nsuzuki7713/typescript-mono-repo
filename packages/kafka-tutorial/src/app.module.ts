import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HelloKafkaModule } from './hello-kafka/hello-kafka.module';

@Module({
  imports: [HelloKafkaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
