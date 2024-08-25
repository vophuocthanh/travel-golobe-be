import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLocationDto {
  @IsNotEmpty()
  @IsOptional()
  id?: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Tên địa điểm không được để trống' })
  @IsString({ message: 'Tên địa điểm phải là chuỗi ký tự' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  description: string;
}
