import { Test, TestingModule } from '@nestjs/testing';
import { RoadVehicleService } from './road-vehicle.service';

describe('RoadVehicleService', () => {
  let service: RoadVehicleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoadVehicleService],
    }).compile();

    service = module.get<RoadVehicleService>(RoadVehicleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
