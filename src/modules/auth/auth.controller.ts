import { Body, Controller, Post, Put, Req, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';
import { AuthService } from 'src/modules/auth/auth.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from 'src/modules/auth/dto/auth.dto';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto): Promise<User> {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginDto): Promise<any> {
    return this.authService.login(body);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto): Promise<any> {
    return this.authService.forgotPassword(body);
  }
  @UseGuards(HandleAuthGuard)
  @Put('reset-password')
  async resetPassword(
    @Req() req: Request,
    @Body() body: ResetPasswordDto,
  ): Promise<any> {
    const user: User = req.user as User;
    return this.authService.resetPassword(user, body.newPassword);
  }
}
