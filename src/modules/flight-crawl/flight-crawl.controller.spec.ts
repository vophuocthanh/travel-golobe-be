import { Test, TestingModule } from '@nestjs/testing';
import { FlightCrawlController } from './flight-crawl.controller';

describe('FlightCrawlController', () => {
  let controller: FlightCrawlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlightCrawlController],
    }).compile();

    controller = module.get<FlightCrawlController>(FlightCrawlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
