import { Test, TestingModule } from '@nestjs/testing';
import { FlightCrawlService } from './flight-crawl.service';

describe('FlightCrawlService', () => {
  let service: FlightCrawlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlightCrawlService],
    }).compile();

    service = module.get<FlightCrawlService>(FlightCrawlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
