import { Test, TestingModule } from '@nestjs/testing';
import { HotelCrawlController } from './hotel-crawl.controller';

describe('HotelCrawlController', () => {
  let controller: HotelCrawlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotelCrawlController],
    }).compile();

    controller = module.get<HotelCrawlController>(HotelCrawlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
