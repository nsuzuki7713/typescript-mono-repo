import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LineWebhookController } from './line-webhook/line-webhook.controller';
import { LineWebhookModule } from './line-webhook/line-webhook.module';

@Module({
  imports: [LineWebhookModule],
  controllers: [AppController, LineWebhookController],
  providers: [AppService],
})
export class AppModule {}
