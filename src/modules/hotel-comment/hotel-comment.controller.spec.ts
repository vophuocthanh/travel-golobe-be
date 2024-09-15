import { Test, TestingModule } from '@nestjs/testing';
import { HotelCommentController } from './hotel-comment.controller';

describe('HotelCommentController', () => {
  let controller: HotelCommentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotelCommentController],
    }).compile();

    controller = module.get<HotelCommentController>(HotelCommentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
