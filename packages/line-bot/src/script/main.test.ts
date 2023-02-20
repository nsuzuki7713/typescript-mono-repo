import 'dotenv/config';
import * as line from '@line/bot-sdk';
import * as jose from 'node-jose';
import * as fs from 'fs';
import axios from 'axios';

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

  it.skip('クイックリプライのメッセージ', async () => {
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

  it.skip('リッチメニューを作成する', async () => {
    // https://developers.line.biz/ja/reference/messaging-api/#create-rich-menu
    const richmenu: line.RichMenu = {
      size: {
        width: 2500,
        height: 1686,
      },
      selected: true,
      name: 'apiから作成したリッチメニュー',
      chatBarText: 'APIから作成したよ',
      areas: [
        {
          bounds: {
            x: 0,
            y: 0,
            width: 2500,
            height: 1686,
          },
          action: {
            type: 'message',
            label: 'メッセージ',
            text: 'メッセージだよ',
          },
        },
      ],
    };
    const richMenuId = await client.createRichMenu(richmenu);

    console.log(richMenuId);
  });

  it.skip('リッチメニューの配列を取得する', async () => {
    // https://developers.line.biz/ja/reference/messaging-api/#get-rich-menu-list
    const rechmenus = await client.getRichMenuList();

    console.log(rechmenus);
  });

  it.skip('リッチメニューを削除する', async () => {
    const richMenuId = '';
    await client.deleteRichMenu(richMenuId);
  });

  it.skip('リッチメニューの画像をアップロードする', async () => {
    // https://developers.line.biz/ja/reference/messaging-api/#upload-rich-menu-image
    const richMenuId = 'richmenu-fd3f15b59afcc6665305715a34152788';
    await client.setRichMenuImage(
      richMenuId,
      fs.createReadStream('./src/script/images/richmenu-template-guide-07.png'),
    );
  });

  it.skip('リッチメニューの画像をダウンロードする', async () => {
    // https://developers.line.biz/ja/reference/messaging-api/#download-rich-menu-image
    const richMenuId = '';
    const stream = await client.getRichMenuImage(richMenuId);
    stream.pipe(fs.createWriteStream('large-file.png'));
  });

  it.skip('リッチメニューを取得する', async () => {
    // https://developers.line.biz/ja/reference/messaging-api/#get-rich-menu
    const richMenuId = 'richmenu-fd3f15b59afcc6665305715a34152788';
    const richMenu = await client.getRichMenu(richMenuId);

    console.log(richMenu);
  });

  it.skip('デフォルトのリッチメニューを設定する', async () => {
    // https://developers.line.biz/ja/reference/messaging-api/#set-default-rich-menu
    const richMenuId = 'richmenu-fd3f15b59afcc6665305715a34152788';

    await client.setDefaultRichMenu(richMenuId);
  });

  it.skip('デフォルトのリッチメニューのIDを取得する', async () => {
    const defalutRichMenuId = await client.getDefaultRichMenuId();

    console.log(defalutRichMenuId);
  });

  describe('メッセージオブジェクト', () => {
    it.skip('テキストメッセージ', async () => {
      const message: line.TextMessage = {
        type: 'text',
        text: 'Hello push message2',
      };

      await client.pushMessage(userId, message);
    });

    it.skip('スタンプメッセージ', async () => {
      const message: line.StickerMessage = {
        type: 'sticker',
        packageId: '446',
        stickerId: '1988',
      };

      await client.pushMessage(userId, message);
    });

    it.skip('画像メッセージ', async () => {
      const message: line.ImageMessage = {
        type: 'image',
        originalContentUrl:
          'https://1.bp.blogspot.com/-tVeC6En4e_E/X96mhDTzJNI/AAAAAAABdBo/jlD_jvZvMuk3qUcNjA_XORrA4w3lhPkdQCNcBGAsYHQ/s1048/onepiece01_luffy.png',
        previewImageUrl:
          'https://1.bp.blogspot.com/-tVeC6En4e_E/X96mhDTzJNI/AAAAAAABdBo/jlD_jvZvMuk3qUcNjA_XORrA4w3lhPkdQCNcBGAsYHQ/s1048/onepiece01_luffy.png',
      };

      await client.pushMessage(userId, message);
    });

    it.skip('位置情報メッセージ', async () => {
      const message: line.LocationMessage = {
        type: 'location',
        title: '東京新宿',
        address: '〒160-0004 東京都新宿区四谷一丁目6番1号',
        latitude: 35.687574,
        longitude: 139.72922,
      };

      await client.pushMessage(userId, message);
    });

    it.skip('イメージマップメッセージ', async () => {
      const message: line.ImageMapMessage = {
        type: 'imagemap',
        baseUrl:
          'https://1.bp.blogspot.com/-tVeC6En4e_E/X96mhDTzJNI/AAAAAAABdBo/jlD_jvZvMuk3qUcNjA_XORrA4w3lhPkdQCNcBGAsYHQ/s1048/onepiece01_luffy.png',
        altText: 'This is an imagemap',
        baseSize: {
          width: 1040,
          height: 1040,
        },
        actions: [
          {
            type: 'message',
            text: 'Hello',
            area: {
              x: 0,
              y: 0,
              width: 520,
              height: 454,
            },
          },
        ],
      };

      await client.pushMessage(userId, message);
    });
  });

  it.skip('ユーザーのアクセストークンの有効性を検証する', async () => {
    const access_token = '';

    // https://developers.line.biz/ja/reference/line-login/#verify-access-token
    const url = `https://api.line.me/oauth2/v2.1/verify?access_token=${access_token}`;

    const res = await axios.get(url);

    console.log(res.data);
  });

  it.skip('ユーザーのIDトークンを検証する', async () => {
    const id_token = '';

    try {
      // https://developers.line.biz/ja/reference/line-login/#verify-id-token
      const res = await axios.post(
        'https://api.line.me/oauth2/v2.1/verify',
        {
          id_token,
          client_id: process.env['LINE_LOGIN_CHANEL'],
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      console.log(res.data);
    } catch (e) {
      console.log(e);
    }
  });

  it('ユーザー情報を取得する', async () => {
    const access_token = '';

    try {
      // https://developers.line.biz/ja/reference/line-login/#userinfo
      const res = await axios.post(
        'https://api.line.me/oauth2/v2.1/userinfo',
        {},
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      console.log(res.data);
    } catch (e) {
      console.log(e);
    }
  });

  it('ユーザープロフィールを取得する', async () => {
    const access_token = '';

    try {
      // https://developers.line.biz/ja/reference/line-login/#get-user-profile
      const res = await axios.get('https://api.line.me/v2/profile', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      console.log(res.data);
    } catch (e) {
      console.log(e);
    }
  });
});
