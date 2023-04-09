import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PhotoRepositoryService } from './photo.repository';
import { destoryDataSource } from './mysql/dataSource';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, PhotoRepositoryService],
    }).compile();

    appController = app.get(AppController);
  });

  afterAll(async () => {
    await destoryDataSource();
  });

  describe('root', () => {
    it('should return "Hello World!"', async () => {
      await expect(appController.getHello()).resolves.toBe('Hello World!');
    });
  });
});
