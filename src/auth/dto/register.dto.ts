import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsBoolean
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Role } from '../../common/enums/role.enum';

export class RegisterDto {

  @ApiProperty({
    example: 'Abhishek Singh'
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    example: 'abhishek@gmail.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password@123'
  })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @ApiPropertyOptional({
    example: 'user',
    enum: Role
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    example: false
  })
  @IsOptional()
  @IsBoolean()
  isTwoFactorEnabled?: boolean;

}