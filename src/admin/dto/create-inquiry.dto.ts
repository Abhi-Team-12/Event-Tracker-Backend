import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateInquiryDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  message: string;
}
