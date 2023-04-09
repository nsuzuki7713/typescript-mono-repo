import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LineWebhookController } from './line-webhook/line-webhook.controller';
import { LineWebhookModule } from './line-webhook/line-webhook.module';
import { LineLoginModule } from './line-login/line-login.module';

@Module({
  imports: [
    LineWebhookModule,
    ConfigModule.forRoot({ isGlobal: true }),
    LineLoginModule,
  ],
  controllers: [AppController, LineWebhookController],
  providers: [AppService],
})
export class AppModule {}
