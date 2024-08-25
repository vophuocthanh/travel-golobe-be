import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  confirm_password: string;
}
