import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PhotoRepositoryService, PhotoRepository } from './photo.repository';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: PhotoRepositoryService, useClass: PhotoMockRepository },
      ],
    }).compile();

    appController = app.get(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', async () => {
      await expect(appController.getHello()).resolves.toBe('Hello World!');
    });
  });
});

class PhotoMockRepository implements PhotoRepository {
  async create() {
    console.log('aaaa');
  }
}
