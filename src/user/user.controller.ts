import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { User } from '@prisma/client';
import {
  CreateUserDto,
  UpdateUserDto,
  UserFilterType,
  UserPaginationResponseType,
} from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('add')
  create(@Body() body: CreateUserDto): Promise<User> {
    return this.userService.create(body);
  }

  @Get()
  getAll(@Query() params: UserFilterType): Promise<UserPaginationResponseType> {
    return this.userService.getAll(params);
  }

  @Get(':id')
  getDetail(@Param('id') id: string): Promise<User> {
    return this.userService.getDetail(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateUserDto): Promise<User> {
    return this.userService.update(id, data);
  }
}
