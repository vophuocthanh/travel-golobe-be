import { Test, TestingModule } from '@nestjs/testing';
import { FlightCommentController } from './flight-comment.controller';

describe('FlightCommentController', () => {
  let controller: FlightCommentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlightCommentController],
    }).compile();

    controller = module.get<FlightCommentController>(FlightCommentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
