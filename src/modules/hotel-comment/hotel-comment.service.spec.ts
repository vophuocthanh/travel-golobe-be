import { Test, TestingModule } from '@nestjs/testing';
import { HotelCommentService } from './hotel-comment.service';

describe('HotelCommentService', () => {
  let service: HotelCommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HotelCommentService],
    }).compile();

    service = module.get<HotelCommentService>(HotelCommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
