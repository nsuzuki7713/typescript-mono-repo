import 'dotenv/config';
import * as line from '@line/bot-sdk';
import * as jose from 'node-jose';

describe('line api', () => {
  const client = new line.Client({
    channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  });

  const oauthClient = new line.OAuth();

  it.skip('Webhookエンドポイントの情報を取得する', async () => {
    // https://developers.line.biz/ja/reference/messaging-api/#get-webhook-endpoint-information
    const res = await client.getWebhookEndpointInfo();

    console.log(res.active);
    console.log(res.endpoint);
  });

  it.skip('Webhookエンドポイントを検証する', async () => {
    // https://developers.line.biz/ja/reference/messaging-api/#test-webhook-endpoint
    const res = await client.testWebhookEndpoint();

    console.log(res);
  });

  it.skip('チャネルアクセストークンv2.1を発行する', async () => {
    // https://developers.line.biz/ja/reference/messaging-api/#issue-channel-access-token-v2-1
    const header = {
      // 固定値
      alg: 'RS256',
      // 固定値
      typ: 'JWT',
      // アサーション署名キーのkid
      // https://developers.line.biz/ja/docs/messaging-api/generate-json-web-token/#generate-a-key-pair-for-the-assertion-signing-key
      kid: process.env['KID'],
    };

    const payload = {
      // チャネルID
      iss: process.env['CHANNEL_ID'],
      // チャネルID
      sub: process.env['CHANNEL_ID'],
      // 固定値
      aud: 'https://api.line.me/',
      // JWTの有効期間。UNIX時間で設定します。
      exp: Math.floor((Date.now() + 5 * 60 * 1000) / 1000),
      // チャネルアクセストークンの有効期間
      token_exp: 86400,
    };

    const privateKey = process.env['PRIVATE_KEY'];

    const jwt = await jose.JWS.createSign(
      { format: 'compact', fields: header },
      JSON.parse(privateKey),
    )
      .update(JSON.stringify(payload))
      .final();

    const res = await oauthClient.issueChannelAccessTokenV2_1(
      jwt as unknown as string,
    );
    console.log(res);
  });

  it.skip('プロフィール情報を取得する', async () => {
    const userId = '';
    const user = await client.getProfile(userId);

    console.log(user);
  });
});
