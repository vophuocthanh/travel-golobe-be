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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Lấy tất cả khách sạn' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getHotels(
    @Query() params: HotelDto,
  ): Promise<HotelPaginationResponseType> {
    return this.hotelService.getHotels(params);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin khách sạn theo id' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getHotelById(@Param('id') id: string): Promise<Hotel> {
    return this.hotelService.getHotelById(id);
  }

  @UseGuards(HandleAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Tạo mới khách sạn' })
  @ApiResponse({ status: 201, description: 'Successfully' })
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
  @ApiOperation({ summary: 'Cập nhật thông tin khách sạn' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateHotelDto,
  ): Promise<Hotel> {
    return this.hotelService.updateHotel(id, body);
  }

  @UseGuards(HandleAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa khách sạn' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.hotelService.deleteHotel(id);
  }

  // Review
}
