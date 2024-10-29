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
import { FlightCrawl } from '@prisma/client';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RolesGuard } from 'src/guard/roles.guard';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { CreateFlightCrawlDto } from 'src/modules/flight-crawl/dto/create.dto';
import {
  FlightCrawlDto,
  FlightCrawlPaginationResponseType,
} from 'src/modules/flight-crawl/dto/flight.dto';
import { UpdateFlightCrawlDto } from 'src/modules/flight-crawl/dto/update.dto';
import { FlightCrawlService } from 'src/modules/flight-crawl/flight-crawl.service';
import { RequestWithUser } from 'src/types/users';

@ApiBearerAuth()
@ApiTags('flight-crawl')
@Controller('flight-crawl')
export class FlightCrawlController {
  constructor(private flightCrawlService: FlightCrawlService) {}

  @Get('crawl')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'items_per_page', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({
    name: 'sort_by_price',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort flights by price',
  })
  @ApiQuery({
    name: 'min_price',
    required: false,
    type: Number,
    description: 'Minimum price filter',
  })
  @ApiQuery({
    name: 'max_price',
    required: false,
    type: Number,
    description: 'Maximum price filter',
  })
  @ApiQuery({
    name: 'start_day',
    required: false,
    type: String,
    description: 'Start day in format dd-mm-yyyy',
  })
  @ApiQuery({
    name: 'end_day',
    required: false,
    type: String,
    description: 'End day in format dd-mm-yyyy',
  })
  @ApiQuery({
    name: 'brand',
    required: false,
    enum: ['Vietnam Airlines', 'VietJet Air', 'Bamboo Airways'],
    description: 'Airline brand',
  })
  @ApiQuery({ name: 'search_from', required: false })
  @ApiQuery({ name: 'search_to', required: false })
  @ApiOperation({ summary: 'Lấy thông tin chuyến bay từ các trang web khác' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async crawlFlights(
    @Query() params: FlightCrawlDto,
  ): Promise<FlightCrawlPaginationResponseType> {
    return this.flightCrawlService.getFlightsCrawl(params);
  }

  @Get('crawl/:id')
  @ApiOperation({ summary: 'Lấy thông tin chuyến bay crawl theo id' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getFlightCrawlById(@Param('id') id: string): Promise<FlightCrawl> {
    return this.flightCrawlService.getFlightCrawlById(id);
  }

  @UseGuards(HandleAuthGuard, RolesGuard)
  @Post('import-csv')
  @ApiOperation({ summary: 'Import chuyến bay từ file CSV' })
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
    await this.flightCrawlService.importFlightsFromCSV(file.path);
    return { message: 'File uploaded and flights imported successfully' };
  }

  @UseGuards(HandleAuthGuard, RolesGuard)
  @Post('crawl')
  @ApiOperation({ summary: 'Thêm thông tin chuyến bay crawl' })
  @ApiResponse({ status: 200, description: 'Successfully added the flight' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async addFlightCrawl(@Body() flightCrawlDto: CreateFlightCrawlDto) {
    return this.flightCrawlService.createFlight(flightCrawlDto);
  }

  @UseGuards(HandleAuthGuard)
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Put('crawl/:id')
  @ApiOperation({ summary: 'Cập nhật thông tin chuyến bay crawl' })
  async updateFlightCrawl(
    @Param('id') id: string,
    @Body() updateFlightDto: UpdateFlightCrawlDto,
  ) {
    return this.flightCrawlService.putFlightCrawl(id, updateFlightDto);
  }

  @UseGuards(HandleAuthGuard, RolesGuard)
  @Delete('crawl/:id')
  @ApiOperation({ summary: 'Xóa chuyến bay crawl' })
  @ApiResponse({ status: 200, description: 'Successfully deleted the flight' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteFlightCrawl(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.flightCrawlService.deleteFlightCrawl(id);
  }

  //  isFavorite

  // Đánh dấu chuyến bay là yêu thích
  @UseGuards(HandleAuthGuard)
  @ApiOperation({ summary: 'Đánh dấu chuyến bay là yêu thích' })
  @ApiResponse({ status: 200, description: 'Successfully marked as favorite' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Post(':id/favorite')
  async markAsFavorite(
    @Param('id') flightId: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    await this.flightCrawlService.markAsFavorite(userId, flightId);
    return { message: 'Marked as favorite' };
  }

  // Bỏ yêu thích
  @UseGuards(HandleAuthGuard)
  @ApiOperation({ summary: 'Bỏ đánh dấu yêu thích chuyến bay' })
  @ApiResponse({
    status: 200,
    description: 'Successfully unmarked as favorite',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Post(':id/unfavorite')
  async unmarkAsFavorite(
    @Param('id') flightId: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    await this.flightCrawlService.unmarkAsFavorite(userId, flightId);
    return { message: 'Unmarked as favorite' };
  }

  // Lấy danh sách các chuyến bay yêu thích của người dùng
  @UseGuards(HandleAuthGuard)
  @ApiOperation({
    summary: 'Lấy danh sách các chuyến bay yêu thích của người dùng',
  })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Get('favorites')
  async getFavoriteFlights(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    const favorites = await this.flightCrawlService.getFavoriteFlights(userId);
    return favorites;
  }
}
