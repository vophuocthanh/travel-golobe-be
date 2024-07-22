import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import {
  CreateUserDto,
  UpdateUserDto,
  UserFilterType,
  UserPaginationResponseType,
} from 'src/modules/user/dto/user.dto';
import { UserService } from 'src/modules/user/user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(HandleAuthGuard)
  @Post('add')
  create(@Body() body: CreateUserDto): Promise<User> {
    return this.userService.create(body);
  }

  @UseGuards(HandleAuthGuard)
  @Get()
  getAll(@Query() params: UserFilterType): Promise<UserPaginationResponseType> {
    return this.userService.getAll(params);
  }

  @UseGuards(HandleAuthGuard)
  @Get(':id')
  getDetail(@Param('id') id: string): Promise<User> {
    return this.userService.getDetail(id);
  }

  @UseGuards(HandleAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateUserDto): Promise<User> {
    return this.userService.update(id, data);
  }

  @Put(':id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body('roleId') roleId: string,
  ) {
    return this.userService.updateUserRole(id, roleId);
  }
}
