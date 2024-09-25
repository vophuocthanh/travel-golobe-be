import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { RoleDto } from 'src/modules/role/dto/role.dto';
import { RoleService } from 'src/modules/role/role.service';

@ApiBearerAuth()
@ApiTags('role')
@Controller('role')
export class RoleController {
  constructor(private rolesService: RoleService) {}

  @ApiOperation({ summary: 'Tạo mới role' })
  @ApiResponse({ status: 201, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Post()
  async createRole(@Body() data: Prisma.RoleCreateInput) {
    return this.rolesService.createRole(data);
  }

  @UseGuards(HandleAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Lấy tất cả các role' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getRoles(@Query() filter: RoleDto) {
    return this.rolesService.getRoles(filter);
  }

  @UseGuards(HandleAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa role' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }
}
