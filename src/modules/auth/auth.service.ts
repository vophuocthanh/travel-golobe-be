import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { mailService } from 'src/lib/mail.service';
import { RegisterDto } from 'src/modules/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthService {
  static jwtService: any;
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  register = async (userData: RegisterDto): Promise<User> => {
    // step 1: check email has already been used
    const user = await this.prismaService.user.findUnique({
      where: {
        email: userData.email,
      },
    });

    if (user) {
      throw new HttpException(
        { message: 'This email has already been used' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // step 2: check confirm password
    if (userData.password !== userData.confirmPassword) {
      throw new HttpException(
        { message: 'Passwords do not match' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // step 3: hash password
    const hashPassword = await hash(userData.password, 10);

    // step 4: get default role
    const defaultRole = await this.prismaService.role.findUnique({
      where: { name: 'USER' },
    });

    if (!defaultRole) {
      throw new HttpException(
        { message: 'Default role "user" not found' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // step 5: store user in the database with default role
    const res = await this.prismaService.user.create({
      data: {
        ...userData,
        password: hashPassword,
        confirmPassword: hashPassword,
        role: {
          connect: { id: defaultRole.id },
        },
      },
    });

    return res;
  };

  login = async (data: { email: string; password: string }): Promise<any> => {
    // step 1: checking user exists by email
    const user = await this.prismaService.user.findUnique({
      where: {
        email: data.email,
      },
      include: {
        role: true,
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

    // step 3: check if user has a role
    if (!user.role) {
      throw new HttpException(
        { message: 'User role not assigned' },
        HttpStatus.FORBIDDEN,
      );
    }

    // step 4: generate access_token and refresh_token
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
    };
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
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    };
  };

  createToken = async (id: string): Promise<string> => {
    if (!process.env.ACCESS_TOKEN_KEY) {
      throw new Error(
        'Access token secret key not found in environment variables.',
      );
    }

    return this.jwtService.sign(
      { id },
      {
        expiresIn: '7d',
        secret: process.env.ACCESS_TOKEN_KEY,
      },
    );
  };

  forgotPassword = async (data: { email: string }) => {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      throw new HttpException(
        { message: `Email ${data.email} not found` },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const access_token = this.createToken(user.id);

    await mailService.sendMail({
      to: data.email,
      html: `Click <a href="http://localhost:5173/reset-password?access_token=${access_token}">here</a> to reset your password`,
      subject: 'Reset  password',
    });

    return {
      message:
        'Your password has been reset successfully. Please login with your new password.',
    };
  };
  resetPassword = async (data: User, newPassword: string) => {
    const isSamePassword = await compare(newPassword, data.password);
    if (isSamePassword) {
      throw new HttpException(
        { message: 'New password cannot be the same as old password' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashPassword = await hash(newPassword, 10);
    const res = await this.prismaService.user.update({
      where: {
        id: data.id,
      },
      data: {
        password: hashPassword,
        confirmPassword: hashPassword,
      },
    });
    return res;
  };

  async validateToken(token: string): Promise<{ userId: string }> {
    try {
      const decoded = this.jwtService.verify(token);
      return { userId: decoded.sub };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
