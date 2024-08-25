import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { RoleService } from 'src/modules/role/role.service';

@ApiBearerAuth()
@ApiTags('role')
@Controller('role')
export class RoleController {
  constructor(private rolesService: RoleService) {}

  @Post()
  async createRole(@Body() data: Prisma.RoleCreateInput) {
    return this.rolesService.createRole(data);
  }

  @Get()
  async getRoles() {
    return this.rolesService.getRoles();
  }

  @Get(':id')
  async getRoleById(@Param('id') id: string) {
    return this.rolesService.getRoleById(id);
  }

  @Patch(':id')
  async updateRole(
    @Param('id') id: string,
    @Body() data: Prisma.RoleUpdateInput,
  ) {
    return this.rolesService.updateRole(id, data);
  }

  @Delete(':id')
  async deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }

  @Patch(':userId/assign-role/:roleId')
  async assignRoleToUser(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.rolesService.assignRoleToUser(userId, roleId);
  }
}
