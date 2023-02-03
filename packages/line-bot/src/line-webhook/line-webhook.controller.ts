import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Controller('line-webhook')
export class LineWebhookController {
  constructor(private configService: ConfigService) {}

  @Post()
  webhook(@Body() body: Record<string, unknown>, @Headers() headers): string {
    // 署名を検証する
    // https://developers.line.biz/ja/docs/messaging-api/receiving-messages/#verifying-signatures
    const channelSecret = this.configService.get<string>('CHANNEL_SECRET');
    console.log(channelSecret);
    const signature = crypto
      .createHmac('sha256', channelSecret)
      .update(JSON.stringify(body))
      .digest('base64');
    if (signature !== headers['x-line-signature']) {
      throw new Error('署名が正しくありません。');
    }

    console.log('header');
    console.log(JSON.stringify(headers));

    console.log('body');
    console.log(JSON.stringify(body));

    return 'webhook';
  }
}
