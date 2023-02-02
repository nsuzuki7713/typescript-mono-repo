import { Body, Controller, Headers, Post } from '@nestjs/common';

@Controller('line-webhook')
export class LineWebhookController {
  @Post()
  webhook(@Body() body: Record<string, unknown>, @Headers() headers): string {
    // todo 署名を検証する
    // https://developers.line.biz/ja/docs/messaging-api/receiving-messages/#verifying-signatures

    console.log('header');
    console.log(JSON.stringify(headers));

    console.log('body');
    console.log(JSON.stringify(body));

    return 'webhook';
  }
}
