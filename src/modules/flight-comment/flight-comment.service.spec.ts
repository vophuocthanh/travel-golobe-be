import { Test, TestingModule } from '@nestjs/testing';
import { FlightCommentService } from './flight-comment.service';

describe('FlightCommentService', () => {
  let service: FlightCommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlightCommentService],
    }).compile();

    service = module.get<FlightCommentService>(FlightCommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
