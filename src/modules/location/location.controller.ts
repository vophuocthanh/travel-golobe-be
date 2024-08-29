import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomLocation } from '@prisma/client';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { CreateLocationDto } from 'src/modules/location/dto/create.location.dto';
import {
  LocationDto,
  LocationPaginationResponseType,
} from 'src/modules/location/dto/location.dto';
import { UpdateLocationDto } from 'src/modules/location/dto/update.location.dto';
import { LocationService } from 'src/modules/location/location.service';
import { RequestWithUser } from 'src/types/users';

@ApiBearerAuth()
@ApiTags('location')
@Controller('location')
export class LocationController {
  constructor(private locationService: LocationService) {}

  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'items_per_page', required: false })
  @ApiQuery({ name: 'search', required: false })
  @Get()
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  getLocations(
    @Query() params: LocationDto,
  ): Promise<LocationPaginationResponseType> {
    return this.locationService.getLocations(params);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  getLocationById(@Query('id') id: string): Promise<CustomLocation> {
    return this.locationService.getLocationById(id);
  }

  @UseGuards(HandleAuthGuard)
  @Post()
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  createLocation(
    @Body() createLocation: CreateLocationDto,
    @Req() req: RequestWithUser,
  ): Promise<CustomLocation> {
    const userId = req.user.id;
    return this.locationService.createLocation(createLocation, userId);
  }

  @Put(':id')
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateLocation(
    @Param('id') id: string,
    @Body() updateLocation: UpdateLocationDto,
  ) {
    return this.locationService.updateLocation(id, updateLocation);
  }

  @UseGuards(HandleAuthGuard)
  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteLocation(@Param('id') id: string): Promise<{ message: string }> {
    return this.locationService.deleteLocation(id);
  }
}
