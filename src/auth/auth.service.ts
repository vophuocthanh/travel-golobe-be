import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { LoginDto, RegisterDto } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  register = async (userData: RegisterDto): Promise<User> => {
    // step: check email has already used
    const user = await this.prismaService.user.findUnique({
      where: {
        email: userData.email,
      },
    });

    if (user) {
      throw new HttpException(
        { messgae: 'This email has already used' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // step 2:  has password and store to database
    const hashPassword = await hash(userData.password, 10);
    const res = await this.prismaService.user.create({
      data: { ...userData, password: hashPassword },
    });

    return res;
  };

  login = async (
    data: { email: string; password: string },
    userData: LoginDto,
  ): Promise<any> => {
    // step 1: checking user is exist by email
    const user = await this.prismaService.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      throw new HttpException(
        { message: 'Account not found' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // step 2: checking password is correct

    const verify = await compare(data.password, user.password);
    if (!verify) {
      throw new HttpException(
        { message: 'Password is not correct' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    //  step 3: check confirm password
    if (userData.password !== userData.confirmPassword) {
      throw new HttpException(
        { message: 'Passwords do not match' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // step 4: generate access_token and refresh_token
    const payload = { id: user.id, name: user.name, email: user.email };
    const access_token = await this.jwtService.signAsync(payload, {
      secret: process.env.ACCESS_TOKEN_KEY,
      expiresIn: '1h',
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: process.env.REFRESH_TOKEN_KEY,
      expiresIn: '7d',
    });

    return {
      access_token,
      refresh_token,
    };
  };
}
