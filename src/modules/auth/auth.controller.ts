import { Body, Controller, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Request } from 'express';
import { AuthService } from 'src/modules/auth/auth.service';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
} from 'src/modules/auth/dto/auth.dto';
import { LoginDto } from 'src/modules/auth/dto/login.dto';
import { RegisterDto } from 'src/modules/auth/dto/register.dto';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';

@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiResponse({ status: 200, description: 'Register Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  register(@Body() body: RegisterDto): Promise<User> {
    return this.authService.register(body);
  }

  @Post('login')
  @ApiResponse({ status: 200, description: 'Login Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  login(@Body() body: LoginDto): Promise<User> {
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
