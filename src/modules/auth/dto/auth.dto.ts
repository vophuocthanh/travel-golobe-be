import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;

  @IsNotEmpty()
  @MinLength(6)
  confirm_password: string;
}
