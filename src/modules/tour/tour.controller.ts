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
import { Tour } from '@prisma/client';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { CreateDtoTour } from 'src/modules/tour/dto/create.dto';
import {
  TourDto,
  TourPaginationResponseType,
} from 'src/modules/tour/dto/tour.dto';
import { TourService } from 'src/modules/tour/tour.service';
import { RequestWithUser } from 'src/types/users';

@Controller('tour')
export class TourController {
  constructor(private tourService: TourService) {}

  @Get()
  getTours(@Query() params: TourDto): Promise<TourPaginationResponseType> {
    return this.tourService.getTours(params);
  }

  @Get(':id')
  getTourById(@Query('id') id: string): Promise<Tour> {
    return this.tourService.getTourById(id);
  }

  @Get('search')
  async searchTours(
    @Query('start') startLocation: string,
    @Query('end') endLocation: string,
  ) {
    return this.tourService.findToursByLocation(startLocation, endLocation);
  }

  @UseGuards(HandleAuthGuard)
  @Post()
  createTour(
    @Body() createTour: CreateDtoTour,
    @Req() req: RequestWithUser,
  ): Promise<Tour> {
    const userId = req.user.id;
    return this.tourService.createTours(createTour, userId);
  }

  @UseGuards(HandleAuthGuard)
  @Put(':id')
  async updateTour(@Param('id') id: string, @Body() updateTour: Tour) {
    return this.tourService.updateTour(id, updateTour);
  }

  @UseGuards(HandleAuthGuard)
  @Delete(':id')
  async deleteTour(@Param('id') id: string) {
    return this.tourService.deleteTour(id);
  }
}
