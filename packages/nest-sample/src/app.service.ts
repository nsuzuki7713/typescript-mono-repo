import { Injectable } from '@nestjs/common';
import { PhotoRepositoryService } from './photo.repository';

/**
 * ユースケース
 */
@Injectable()
export class AppService {
  constructor(private photoRepositoryService: PhotoRepositoryService) {}

  async getHello() {
    await this.photoRepositoryService.create();

    return 'Hello World!';
  }
}
