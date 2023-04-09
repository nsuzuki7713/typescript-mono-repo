import { Inject, Injectable } from '@nestjs/common';
import { PhotoRepositoryService } from './photo.repository';

/**
 * ユースケース
 */
@Injectable()
export class AppService {
  constructor(private photoRepositoryService: PhotoRepositoryService) {}

  // constructor(
  //   private photoRepositoryService: PhotoRepositoryService,
  //   @Inject('TEST') private test: string,
  // ) {
  //   console.log(test);
  // }

  async getHello() {
    await this.photoRepositoryService.create();

    return 'Hello World!';
  }
}
