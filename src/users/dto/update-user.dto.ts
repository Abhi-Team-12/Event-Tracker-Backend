import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {

  @ApiPropertyOptional({
    example: 'Rahul Sharma'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Password@123'
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

}