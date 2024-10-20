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
import { RoadVehicle } from '@prisma/client';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { CreateRoadVehicleDto } from 'src/modules/road-vehicle/dto/create.dto';
import {
  RoadVehicleCrawlDto,
  RoadVehicleCrawlPaginationResponseType,
} from 'src/modules/road-vehicle/dto/road-vehicle.dto';
import { UpdateRoadVehicleCrawlDto } from 'src/modules/road-vehicle/dto/update.dto';
import { RoadVehicleService } from 'src/modules/road-vehicle/road-vehicle.service';

@ApiBearerAuth()
@ApiTags('road-vehicle')
@Controller('road-vehicle')
export class RoadVehicleController {
  constructor(private roadVehicleService: RoadVehicleService) {}

  @Get('crawl')
  @ApiQuery({
    name: 'sort_by_price',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort road vehicles by price',
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
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'items_per_page', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiOperation({
    summary: 'Lấy thông tin phương tiện đường bộ từ các trang web khác',
  })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async crawlFlights(
    @Query() params: RoadVehicleCrawlDto,
  ): Promise<RoadVehicleCrawlPaginationResponseType> {
    return this.roadVehicleService.getRoadVehicleCrawl(params);
  }

  @Get('crawl/:id')
  @ApiOperation({ summary: 'Lấy thông tin phương tiện đường bộ crawl theo id' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getFlightCrawlById(@Param('id') id: string): Promise<RoadVehicle> {
    return this.roadVehicleService.getRoadVehicleCrawlById(id);
  }

  @UseGuards(HandleAuthGuard)
  @Post('crawl')
  @ApiOperation({ summary: 'Thêm thông tin phương tiện đường bộ' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async postRoadVehicleCrawl(
    @Body() createRoadVehicle: CreateRoadVehicleDto,
  ): Promise<RoadVehicle> {
    return this.roadVehicleService.createRoadVehicleCrawl(createRoadVehicle);
  }

  @UseGuards(HandleAuthGuard)
  @Post('import-csv')
  @ApiOperation({
    summary: 'Import thông tin phương tiện đường bộ từ file CSV',
  })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
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
    await this.roadVehicleService.importRoadVehicleFromCSV(file.path);
    return { message: 'File uploaded and road vehicle imported successfully' };
  }

  @UseGuards(HandleAuthGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin phương tiện đường bộ' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Put('crawl/:id')
  async putRoadVehicleCrawl(
    @Param('id') id: string,
    @Body() updateRoadVehicle: UpdateRoadVehicleCrawlDto,
  ): Promise<RoadVehicle> {
    return this.roadVehicleService.putRoadVehicleCrawl(id, updateRoadVehicle);
  }

  @UseGuards(HandleAuthGuard)
  @Delete('crawl/:id')
  @ApiOperation({ summary: 'Xóa thông tin phương tiện đường bộ' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteRoadVehicleCrawl(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.roadVehicleService.deleteRoadVehicleCrawl(id);
  }
}
