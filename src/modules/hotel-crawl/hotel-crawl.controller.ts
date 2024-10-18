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
import { CreateHotelCrawlDto } from 'src/modules/hotel-crawl/dto/create.dto';
import {
  HotelCrawlDto,
  HotelCrawlPaginationResponseType,
} from 'src/modules/hotel-crawl/dto/hotel-crawl.dto';
import { UpdateHotelCrawlDto } from 'src/modules/hotel-crawl/dto/update.dto';
import { HotelCrawlService } from 'src/modules/hotel-crawl/hotel-crawl.service';
import { RequestWithUser } from 'src/types/users';

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
  @ApiQuery({
    name: 'star_number',
    required: false,
    type: Number,
    description: 'Filter hotels by star number',
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
  @Post('crawl')
  @ApiOperation({ summary: 'Thêm thông tin khách sạn từ trang web khác' })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createHotelCrawl(@Body() hotelCrawlDto: CreateHotelCrawlDto) {
    return this.hotelCrawlService.createHotelCrawl(hotelCrawlDto);
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

  // isFavorite

  // Đánh dấu khách sạn là yêu thích
  @UseGuards(HandleAuthGuard)
  @ApiOperation({ summary: 'Đánh dấu khách sạn là yêu thích' })
  @ApiResponse({ status: 201, description: 'Marked as favorite' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Post(':id/favorite')
  async markAsFavorite(
    @Param('id') hotelId: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    await this.hotelCrawlService.markAsFavorite(userId, hotelId);
    return { message: 'Marked as favorite' };
  }

  // Bỏ yêu thích
  @UseGuards(HandleAuthGuard)
  @ApiOperation({ summary: 'Bỏ đánh dấu yêu thích khách sạn' })
  @ApiResponse({ status: 201, description: 'Unmarked as favorite' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Post(':id/unfavorite')
  async unmarkAsFavorite(
    @Param('id') hotelId: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    await this.hotelCrawlService.unmarkAsFavorite(userId, hotelId);
    return { message: 'Unmarked as favorite' };
  }

  // Lấy danh sách các khách sạn yêu thích của người dùng
  @UseGuards(HandleAuthGuard)
  @ApiOperation({
    summary: 'Lấy danh sách các khách sạn yêu thích của người dùng',
  })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Get('favorites')
  async getFavoriteHotels(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    const favorites = await this.hotelCrawlService.getFavoriteHotels(userId);
    return favorites;
  }

  // // Kiểm tra xem khách sạn có được yêu thích hay không
  // @UseGuards(HandleAuthGuard)
  // @ApiOperation({
  //   summary: 'Kiểm tra xem khách sạn có được yêu thích hay không',
  // })
  // @ApiResponse({ status: 200, description: 'Successfully' })
  // @ApiResponse({ status: 400, description: 'Bad Request' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // @ApiResponse({ status: 500, description: 'Internal Server Error' })
  // @Get(':id/is-favorite')
  // async isFavorite(@Param('id') hotelId: string, @Req() req: RequestWithUser) {
  //   const userId = req.user.id;
  //   const isFavorite = await this.hotelCrawlService.isFavorite(userId, hotelId);
  //   return { isFavorite };
  // }
}
