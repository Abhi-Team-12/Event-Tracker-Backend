import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {

  @ApiProperty({
    example: 'Rahul Sharma'
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'rahul@gmail.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password@123'
  })
  @IsString()
  @MinLength(6)
  password: string;

}