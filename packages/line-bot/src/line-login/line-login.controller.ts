import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Controller('line-login')
export class LineLoginController {
  constructor(private configService: ConfigService) {}

  @Get()
  // @Redirect()
  getLoginUrl() {
    console.log('getLoginUrl');
    const response_type = 'code';
    const client_id = this.configService.get('LINE_LOGIN_CHANEL');
    const redirect_uri = encodeURI(
      this.configService.get('LINE_LOGIN_REDIRECT_URL'),
    );
    const state = crypto.randomUUID();
    const scope = 'profile%20openid';

    return {
      uri: `https://access.line.me/oauth2/v2.1/authorize?response_type=${response_type}&client_id=${client_id}&redirect_uri=${redirect_uri}&state=${state}&scope=${scope}`,
    };
  }

  @Get('redirect')
  async redirect(@Query() query: { code: string; state: string }) {
    console.log('リダイレクト');
    const res = await axios.post(
      'https://api.line.me/oauth2/v2.1/token',
      {
        grant_type: 'authorization_code',
        code: query.code,
        redirect_uri: encodeURI(
          this.configService.get('LINE_LOGIN_REDIRECT_URL'),
        ),
        client_id: this.configService.get('LINE_LOGIN_CHANEL'),
        client_secret: this.configService.get('LINE_LOGIN_SECRET'),
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    console.log(res.data);
    return 'リダイレクト';
  }
}
