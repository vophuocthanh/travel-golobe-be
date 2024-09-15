import { Test, TestingModule } from '@nestjs/testing';
import { TourCommentService } from './tour-comment.service';

describe('TourCommentService', () => {
  let service: TourCommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TourCommentService],
    }).compile();

    service = module.get<TourCommentService>(TourCommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
