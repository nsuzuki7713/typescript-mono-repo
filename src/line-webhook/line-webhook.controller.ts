import { Body, Controller, Post } from '@nestjs/common';

@Controller('line-webhook')
export class LineWebhookController {
  @Post()
  webhook(@Body() body: Record<string, unknown>): string {
    console.log(body);
    return 'webhook';
  }
}
