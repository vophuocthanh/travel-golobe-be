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
import { FlightCrawl } from '@prisma/client';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import {
  FlightCrawlDto,
  FlightCrawlPaginationResponseType,
} from 'src/modules/flight-crawl/dto/flight.dto';
import { UpdateFlightCrawlDto } from 'src/modules/flight-crawl/dto/update.dto';
import { FlightCrawlService } from 'src/modules/flight-crawl/flight-crawl.service';

@ApiBearerAuth()
@ApiTags('flight-crawl')
@Controller('flight-crawl')
export class FlightCrawlController {
  constructor(private flightCrawlService: FlightCrawlService) {}

  @Get('crawl')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'items_per_page', required: false })
  @ApiQuery({ name: 'search', required: false })
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

  @UseGuards(HandleAuthGuard)
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

  @UseGuards(HandleAuthGuard)
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
}
