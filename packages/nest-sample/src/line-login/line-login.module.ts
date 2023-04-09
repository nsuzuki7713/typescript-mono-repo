import { Module } from '@nestjs/common';
import { LineLoginController } from './line-login.controller';

@Module({
  controllers: [LineLoginController],
})
export class LineLoginModule {}
