import { Test, TestingModule } from '@nestjs/testing';
import { RoadVehicleController } from './road-vehicle.controller';

describe('RoadVehicleController', () => {
  let controller: RoadVehicleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoadVehicleController],
    }).compile();

    controller = module.get<RoadVehicleController>(RoadVehicleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
