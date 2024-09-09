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
import { RegisterDto } from 'src/modules/auth/dto/register.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  generateVerificationCode(): { code: string; expiresAt: Date } {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // Mã xác nhận hết hạn sau 5 phút
    return { code, expiresAt };
  }

  // Gửi email xác thực
  async sendVerificationEmail(email: string, verificationCode: string) {
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          background-color: #007bff;
          color: white;
          padding: 15px;
          border-radius: 8px 8px 0 0;
        }
        .content {
          padding: 20px;
          font-size: 16px;
          color: #333333;
          line-height: 1.5;
        }
        .verification-code {
          display: block;
          width: fit-content;
          margin: 20px auto;
          background-color: #f4f4f4;
          padding: 15px 25px;
          font-size: 24px;
          font-weight: bold;
          color: #007bff;
          border: 2px solid #007bff;
          border-radius: 8px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
          color: #888888;
        }
        .footer a {
          color: #007bff;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Xác nhận Đăng ký</h1>
        </div>
        <div class="content">
          <p>Chào bạn,</p>
          <p>Cảm ơn bạn đã đăng ký tài khoản trên nền tảng Travel Golobe của chúng tôi. Để hoàn tất quá trình đăng ký, vui lòng nhập mã xác thực dưới đây:</p>
          <div class="verification-code">
            ${verificationCode}
          </div>
          <p>Mã xác thực này sẽ hết hạn sau 5 phút. Nếu bạn không thực hiện đăng ký, mã xác thực sẽ không còn giá trị.</p>
          <p>Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này.</p>
        </div>
        <div class="footer">
          <p>Trân trọng,<br>Travel Golobe Team ❤️🐼🐧🚀⚡⚡</p>
        </div>
      </div>
    </body>
    </html>
    `;

    await mailService.sendMail({
      to: email,
      html: htmlTemplate,
      subject: 'Xác nhận đăng ký',
    });
  }

  async register(userData: RegisterDto): Promise<any> {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new HttpException(
        { message: 'Email đã được sử dụng' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Kiểm tra mật khẩu
    if (userData.password !== userData.confirmPassword) {
      throw new HttpException(
        { message: 'Mật khẩu không khớp' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Hash mật khẩu
    const hashedPassword = await hash(userData.password, 10);
    const { code: verificationCode, expiresAt: verificationCodeExpiresAt } =
      this.generateVerificationCode(); // Tạo mã xác nhận và thời gian hết hạn

    // Lấy vai trò mặc định
    const defaultRole = await this.prismaService.role.findUnique({
      where: { name: 'USER' },
    });

    if (!defaultRole) {
      throw new HttpException(
        { message: 'Không tìm thấy vai trò mặc định' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Tạo người dùng mới với trạng thái chưa xác thực
    await this.prismaService.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        confirmPassword: hashedPassword,
        name: userData.name,
        verificationCode: verificationCode,
        verificationCodeExpiresAt: verificationCodeExpiresAt, // Lưu thời gian hết hạn
        isVerified: false,
        role: {
          connect: { id: defaultRole.id },
        },
      },
    });

    // Gửi mã xác nhận qua email
    await this.sendVerificationEmail(userData.email, verificationCode);

    return { message: 'Vui lòng kiểm tra email để xác nhận đăng ký' };
  }

  // Xác thực mã xác nhận
  async verifyEmail(email: string, code: string): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HttpException(
        { message: 'Người dùng không tồn tại' },
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.isVerified) {
      throw new HttpException(
        { message: 'Người dùng đã xác thực' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.verificationCode !== code) {
      throw new HttpException(
        { message: 'Mã xác thực không đúng' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const now = new Date();
    if (now > user.verificationCodeExpiresAt) {
      throw new HttpException(
        { message: 'Mã xác thực đã hết hạn' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Cập nhật trạng thái người dùng thành đã xác thực
    await this.prismaService.user.update({
      where: { email },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      }, // Xóa mã xác nhận sau khi thành công
    });

    return { message: 'Đăng ký thành công!' };
  }

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
    if (!user.isVerified) {
      throw new HttpException(
        { message: 'Account is not verified' },
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

    const access_token = await this.createToken(user.id);

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
    const user = await this.prismaService.user.findUnique({
      where: { id: data.id },
      select: {
        password: true,
      },
    });

    if (!user || !user.password) {
      throw new HttpException(
        { message: 'User password is missing' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const isSamePassword = await compare(newPassword, user.password);
    if (isSamePassword) {
      throw new HttpException(
        { message: 'New password cannot be the same as the old password' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashPassword = await hash(newPassword, 10);

    await this.prismaService.user.update({
      where: {
        id: data.id,
      },
      data: {
        password: hashPassword,
        confirmPassword: hashPassword,
      },
    });

    return { message: 'Password reset successfully' };
  };

  async validateToken(token: string): Promise<{ userId: string }> {
    try {
      const decoded = this.jwtService.verify(token);
      return { userId: decoded.sub };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async changePassword(
    user: User,
    current_password: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<any> {
    // Step 1: Lấy mật khẩu hiện tại từ cơ sở dữ liệu
    const userRecord = await this.prismaService.user.findUnique({
      where: { id: user.id },
      select: {
        password: true,
      },
    });

    if (!userRecord || !userRecord.password) {
      throw new HttpException(
        { message: 'User password is missing' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Step 2: Xác nhận mật khẩu hiện tại (current_password)
    const isCurrentPasswordCorrect = await compare(
      current_password,
      userRecord.password,
    );
    if (!isCurrentPasswordCorrect) {
      throw new HttpException(
        { message: 'Current password is incorrect' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Step 3: Kiểm tra mật khẩu mới có trùng với mật khẩu hiện tại không
    if (current_password === newPassword) {
      throw new HttpException(
        { message: 'New password cannot be the same as the current password' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Step 4: Xác nhận mật khẩu mới khớp với confirm password
    if (newPassword !== confirmPassword) {
      throw new HttpException(
        { message: 'New password and confirm password do not match' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Step 5: Hash mật khẩu mới và cập nhật trong cơ sở dữ liệu
    const hashedPassword = await hash(newPassword, 10);
    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return { message: 'Password changed successfully' };
  }
}
