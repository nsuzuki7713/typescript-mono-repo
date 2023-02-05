import { EventMessage, WebhookRequestBody } from '@line/bot-sdk';
import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Controller('line-webhook')
export class LineWebhookController {
  constructor(private configService: ConfigService) {}

  @Post()
  @HttpCode(200)
  webhook(@Body() body: WebhookRequestBody, @Headers() headers): string {
    // console.log('header');
    // console.log(JSON.stringify(headers));

    // console.log('body');
    // console.log(JSON.stringify(body));

    // 署名を検証する
    // https://developers.line.biz/ja/docs/messaging-api/receiving-messages/#verifying-signatures
    const channelSecret = this.configService.get<string>('CHANNEL_SECRET');
    const signature = crypto
      .createHmac('sha256', channelSecret)
      .update(JSON.stringify(body))
      .digest('base64');
    if (signature !== headers['x-line-signature']) {
      throw new Error('署名が正しくありません。');
    }

    if (body.events.length === 0) {
      // 疎通確認はeventsは空配列で受け取る
      console.log('疎通確認イベント');
      return;
    }

    // イベントには複数のイベントが入ってくる。
    for (const event of body.events) {
      switch (event.type) {
        // メッセージイベント
        // https://developers.line.biz/ja/reference/messaging-api/#message-event
        case 'message': {
          console.log(`userId: ${event.source.userId}`);
          this.processMessage(event.message);
          break;
        }

        // 送信取り消しイベント
        // https://developers.line.biz/ja/reference/messaging-api/#unsend-event
        case 'unsend': {
          console.log('送信取り消しイベント');
          break;
        }

        // フォローイベント
        // https://developers.line.biz/ja/reference/messaging-api/#follow-event
        case 'follow': {
          console.log('フォローイベント。(友だち追加またはブロック解除された)');
          break;
        }

        // フォロー解除イベント
        // https://developers.line.biz/ja/reference/messaging-api/#unfollow-event
        case 'unfollow': {
          console.log('ブロックされた');
          break;
        }

        // https://developers.line.biz/ja/reference/messaging-api/#postback-event
        case 'postback': {
          // 日時選択アクションやリッチメニューのアクションなど
          console.log('ポストバックイベント');
        }

        // https://developers.line.biz/ja/reference/messaging-api/#account-link-event
        case 'accountLink': {
          console.log('アカウント連携イベント');
        }
      }
    }

    return 'webhook';
  }

  private processMessage(event: EventMessage) {
    switch (event.type) {
      case 'text': {
        // https://developers.line.biz/ja/reference/messaging-api/#wh-text
        console.log('メッセージ: ', event.text);
        console.log('絵文字: ', event.emojis);
        break;
      }

      case 'image': {
        // https://developers.line.biz/ja/reference/messaging-api/#wh-image
        // 画像ファイルのバイナリデータは別APIから取得する
        console.log(event);
        break;
      }

      case 'video': {
        // https://developers.line.biz/ja/reference/messaging-api/#wh-video
        // 動画ファイルのバイナリデータは別APIから取得する
        console.log(event);
        break;
      }

      case 'audio': {
        // https://developers.line.biz/ja/reference/messaging-api/#wh-audio
        // 音声ファイルのバイナリデータは別APIから取得する
        console.log(event);
        break;
      }

      case 'file': {
        // https://developers.line.biz/ja/reference/messaging-api/#wh-file
        // ファイルのバイナリデータは別APIから取得する
        console.log(event);
        break;
      }

      case 'location': {
        // https://developers.line.biz/ja/reference/messaging-api/#wh-location
        console.log(event);
        break;
      }

      case 'sticker': {
        // スタンプ
        // https://developers.line.biz/ja/reference/messaging-api/#wh-sticker
        console.log(event);
        break;
      }
    }
  }
}
