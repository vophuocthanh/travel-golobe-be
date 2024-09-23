import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HotelCrawl } from '@prisma/client';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import {
  HotelCrawlDto,
  HotelCrawlPaginationResponseType,
} from 'src/modules/hotel-crawl/dto/hotel-crawl.dto';
import { UpdateHotelCrawlDto } from 'src/modules/hotel-crawl/dto/update.dto';
import { HotelCrawlService } from 'src/modules/hotel-crawl/hotel-crawl.service';

@ApiBearerAuth()
@ApiTags('hotel-crawl')
@Controller('hotel-crawl')
export class HotelCrawlController {
  constructor(private hotelCrawlService: HotelCrawlService) {}

  @Get('crawl')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'items_per_page', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiOperation({ summary: 'Lấy thông tin khách sạn từ các trang web khác' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiQuery({
    name: 'sort_by_price',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort flights by price',
  })
  @ApiQuery({
    name: 'min_price',
    required: false,
    type: String,
    description: 'Minimum price filter',
  })
  @ApiQuery({
    name: 'max_price',
    required: false,
    type: String,
    description: 'Maximum price filter',
  })
  async crawlFlights(
    @Query() params: HotelCrawlDto,
  ): Promise<HotelCrawlPaginationResponseType> {
    return this.hotelCrawlService.getHotelCrawl(params);
  }

  @Get('crawl/:id')
  @ApiOperation({ summary: 'Lấy thông tin khách sạn crawl theo id' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getFlightCrawlById(@Param('id') id: string): Promise<HotelCrawl> {
    return this.hotelCrawlService.getHotelCrawlById(id);
  }

  @UseGuards(HandleAuthGuard)
  @Post('import-csv')
  @ApiOperation({ summary: 'Import danh sách khách sạn từ file csv' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { message: 'No file uploaded' };
    }
    await this.hotelCrawlService.importHotelsFromCSV(file.path);
    return { message: 'File uploaded and hotels imported successfully' };
  }

  @UseGuards(HandleAuthGuard)
  @ApiResponse({ status: 200, description: 'Update successfully the hotel' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiOperation({ summary: 'Cập nhật thông tin khách sạn' })
  @Put('crawl/:id')
  async updateHotelCrawl(
    @Param('id') id: string,
    @Body() updateHotelCrawlDto: UpdateHotelCrawlDto,
  ) {
    return this.hotelCrawlService.putHotelCrawl(id, updateHotelCrawlDto);
  }

  @UseGuards(HandleAuthGuard)
  @ApiResponse({ status: 200, description: 'Delete successfully the hotel' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiOperation({ summary: 'Xóa thông tin khách sạn' })
  @Delete('crawl/:id')
  async deleteFlightCrawl(id: string): Promise<{ message: string }> {
    return this.hotelCrawlService.deleteHotelCrawl(id);
  }
}
