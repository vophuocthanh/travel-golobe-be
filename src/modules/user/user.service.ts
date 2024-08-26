import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { hash } from 'bcrypt';
import {
  CreateUserDto,
  UpdateUserDto,
  UserFilterType,
  UserPaginationResponseType,
} from 'src/modules/user/dto/user.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async create(body: CreateUserDto): Promise<User> {
    //step1: checking email has already exist
    const user = await this.prismaService.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (user) {
      throw new HttpException(
        { message: 'This email has been used.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    //step 2: hash password and store to bd
    const hashPassword = await hash(body.password, 10);
    const result = await this.prismaService.user.create({
      data: { ...body, password: hashPassword },
    });

    return result;
  }

  async getAll(filters: UserFilterType): Promise<UserPaginationResponseType> {
    const items_per_page = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const search = filters.search || '';

    const skip = page > 1 ? (page - 1) * items_per_page : 0;
    const users = await this.prismaService.user.findMany({
      take: items_per_page,
      skip,
      where: {
        OR: [
          {
            name: {
              contains: search,
            },
          },
          {
            email: {
              contains: search,
            },
          },
        ],
      },
      orderBy: {
        createAt: 'desc',
      },
    });

    const total = await this.prismaService.user.count({
      where: {
        OR: [
          {
            name: {
              contains: search, // contains co nghia la chứa
            },
          },
          {
            email: {
              contains: search,
            },
          },
        ],
      },
    });

    return {
      data: users,
      total,
      currentPage: page,
      itemsPerPage: items_per_page,
    };
  }

  async getDetail(
    id: string,
  ): Promise<Omit<User, 'password' | 'confirmPassword'>> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, confirmPassword, ...userWithoutPassword } =
      await this.prismaService.user.findFirst({
        where: { id },
      });
    return userWithoutPassword;
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    return await this.prismaService.user.update({
      where: {
        id,
      },
      data,
    });
  }
  async updateUserRole(userId: string, roleId: string): Promise<User> {
    const role = await this.prismaService.role.findUnique({
      where: {
        id: roleId,
      },
    });

    if (!role) {
      throw new HttpException(
        { message: 'Role not found.' },
        HttpStatus.NOT_FOUND,
      );
    }

    return await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        roleId,
      },
    });
  }
  async updateAvatar(userId: string, avatar: string): Promise<User> {
    return await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        avatar,
      },
    });
  }
}
