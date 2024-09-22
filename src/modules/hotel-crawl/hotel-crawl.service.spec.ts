import { Test, TestingModule } from '@nestjs/testing';
import { HotelCrawlService } from './hotel-crawl.service';

describe('HotelCrawlService', () => {
  let service: HotelCrawlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HotelCrawlService],
    }).compile();

    service = module.get<HotelCrawlService>(HotelCrawlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
