import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PhotoRepositoryService } from './photo.repository';

describe('AppController', () => {
  let appController: AppController;
  let photoRepositoryService: PhotoRepositoryService;
  let spyOnCreate: jest.SpyInstance;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, PhotoRepositoryService],
    }).compile();

    appController = app.get(AppController);
    photoRepositoryService = app.get(PhotoRepositoryService);
    spyOnCreate = jest.spyOn(photoRepositoryService, 'create');
  });

  describe('root', () => {
    it('should return "Hello World!"', async () => {
      spyOnCreate.mockImplementation(() => {
        console.log('aaa');
      });

      await expect(appController.getHello()).resolves.toBe('Hello World!');
      expect(spyOnCreate).toBeCalled();
    });
  });
});
