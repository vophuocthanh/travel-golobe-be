import {
  Controller,
  Get,
  Param,
  Post,
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
  async crawlFlights(
    @Query() params: HotelCrawlDto,
  ): Promise<HotelCrawlPaginationResponseType> {
    return this.hotelCrawlService.getFlightsCrawl(params);
  }

  @Get('crawl/:id')
  @ApiOperation({ summary: 'Lấy thông tin khách sạn crawl theo id' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getFlightCrawlById(@Param('id') id: string): Promise<HotelCrawl> {
    return this.hotelCrawlService.getFlightCrawlById(id);
  }

  @UseGuards(HandleAuthGuard)
  @Post('import-csv')
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
}
