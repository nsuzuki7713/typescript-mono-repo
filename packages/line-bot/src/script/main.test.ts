import 'dotenv/config';
import * as line from '@line/bot-sdk';
import * as jose from 'node-jose';

describe('line api', () => {
  const client = new line.Client({
    channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  });

  const oauthClient = new line.OAuth();
  const userId = process.env['USER_ID'];

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

  it.skip('応答メッセージを送る', async () => {
    // https://developers.line.biz/ja/reference/messaging-api/#send-reply-message
    // 応答トークンは一度のみ使用できます。
    // 応答トークンは、Webhookを受信してから1分以内に使用する必要があります。1分を超える場合の使用については、動作は保証されません。

    const replyToken = '';
    const message = {
      type: 'text',
      text: 'Hello World!',
    } as const;

    await client.replyMessage(replyToken, message);
  });

  it.skip('プッシュメッセージを送る', async () => {
    // https://developers.line.biz/ja/reference/messaging-api/#send-push-message
    const message = {
      type: 'text',
      text: 'Hello push message',
    } as const;
    const userId = '';

    await client.pushMessage(userId, message);
  });

  it('クイックリプライのメッセージ', async () => {
    const message: line.TextMessage = {
      type: 'text',
      text: 'Hello push message',
      quickReply: {
        items: [
          {
            type: 'action',
            action: {
              // https://developers.line.biz/ja/reference/messaging-api/#postback-action
              // postbackイベントでwebhookへ通知される
              type: 'postback',
              label: 'postBackです',
              data: 'postback1',
              displayText: 'リプライ後にlineのメッセージに表示される',
            },
          },
          {
            type: 'action',
            action: {
              // https://developers.line.biz/ja/reference/messaging-api/#message-action
              type: 'message',
              label: 'メッセージ',
              text: 'メッセージだよ',
            },
          },
          {
            type: 'action',
            action: {
              // https://developers.line.biz/ja/reference/messaging-api/#uri-action
              type: 'uri',
              label: 'uriアクション',
              uri: 'https://developers.line.biz/ja/reference/messaging-api/#uri-action',
            },
          },
          {
            type: 'action',
            action: {
              // https://developers.line.biz/ja/reference/messaging-api/#datetime-picker-action
              type: 'datetimepicker',
              label: '日時選択アクション',
              data: 'datetimepicker',
              mode: 'date',
            },
          },
          {
            type: 'action',
            action: {
              // https://developers.line.biz/ja/reference/messaging-api/#camera-action
              type: 'camera',
              label: 'Open camera',
            },
          },
          {
            type: 'action',
            action: {
              // https://developers.line.biz/ja/reference/messaging-api/#camera-roll-action
              type: 'cameraRoll',
              label: 'Send photo',
            },
          },
          {
            type: 'action',
            action: {
              // https://developers.line.biz/ja/reference/messaging-api/#camera-roll-action
              type: 'location',
              label: '位置情報アクション',
            },
          },
        ],
      },
    };

    await client.pushMessage(userId, message);
  });
});
