import { Test, TestingModule } from '@nestjs/testing';
import { TourCommentController } from './tour-comment.controller';

describe('TourCommentController', () => {
  let controller: TourCommentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TourCommentController],
    }).compile();

    controller = module.get<TourCommentController>(TourCommentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
