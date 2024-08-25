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
import { Hotel } from '@prisma/client';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { CreateHotelDto } from 'src/modules/hotel/dto/create.dto';
import {
  HotelDto,
  HotelPaginationResponseType,
} from 'src/modules/hotel/dto/hotel.dto';
import { UpdateHotelDto } from 'src/modules/hotel/dto/update.dto';
import { HotelService } from 'src/modules/hotel/hotel.service';
import { RequestWithUser } from 'src/types/users';

@ApiBearerAuth()
@ApiTags('hotel')
@Controller('hotel')
export class HotelController {
  constructor(private hotelService: HotelService) {}

  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'items_per_page', required: false })
  @ApiQuery({ name: 'search', required: false })
  @Get()
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  getHotels(@Query() params: HotelDto): Promise<HotelPaginationResponseType> {
    return this.hotelService.getHotels(params);
  }
  @Get(':id')
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  getHotelById(@Query('id') id: string): Promise<Hotel> {
    return this.hotelService.getHotelById(id);
  }

  @UseGuards(HandleAuthGuard)
  @Post()
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createHotel(
    @Body() createHotelDto: CreateHotelDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.hotelService.createHotel(createHotelDto, userId);
  }

  @UseGuards(HandleAuthGuard)
  @Put(':id')
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateHotelDto,
  ): Promise<Hotel> {
    return this.hotelService.updateHotel(id, body);
  }

  @UseGuards(HandleAuthGuard)
  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  delete(@Param('id') id: string): Promise<Hotel> {
    return this.hotelService.deleteHotel(id);
  }
}
