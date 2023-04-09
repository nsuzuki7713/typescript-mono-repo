import { Test, TestingModule } from '@nestjs/testing';
import { LineLoginController } from './line-login.controller';

describe('LineLoginController', () => {
  let controller: LineLoginController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LineLoginController],
    }).compile();

    controller = module.get<LineLoginController>(LineLoginController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
