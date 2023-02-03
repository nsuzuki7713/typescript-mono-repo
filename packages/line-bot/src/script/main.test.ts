import 'dotenv/config';
import * as line from '@line/bot-sdk';

describe('line api', () => {
  console.log(process.env['CHANNEL_ACCESS_TOKEN']);
  const client = new line.Client({
    channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  });

  it('ユーザーが送ったコンテンツを取得する', async () => {});
});
