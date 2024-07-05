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
import { Hotel } from '@prisma/client';
import { HandleAuthGuard } from 'src/auth/auth.guard';
import {
  CreateHotelDto,
  HotelDto,
  HotelPaginationResponseType,
  RequestWithUser,
} from 'src/hotel/dto/hotel.dto';
import { HotelService } from 'src/hotel/hotel.service';

@Controller('hotel')
export class HotelController {
  constructor(private hotelService: HotelService) {}
  @UseGuards(HandleAuthGuard)
  @Get()
  getHotels(@Query() params: HotelDto): Promise<HotelPaginationResponseType> {
    return this.hotelService.getHotels(params);
  }
  @UseGuards(HandleAuthGuard)
  @Get(':id')
  getHotelById(@Query('id') id: string): Promise<Hotel> {
    return this.hotelService.getHotelById(id);
  }

  @UseGuards(HandleAuthGuard)
  @Post()
  async createHotel(
    @Body() createHotelDto: CreateHotelDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    console.log('userId:', userId);
    return this.hotelService.createHotel(createHotelDto, userId);
  }

  @UseGuards(HandleAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: Hotel): Promise<Hotel> {
    return this.hotelService.updateHotel(id, body);
  }

  @UseGuards(HandleAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string): Promise<Hotel> {
    return this.hotelService.deleteHotel(id);
  }
}
