import {
  IsString,
  IsDateString,
  IsOptional
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {

  @ApiProperty({
    example: 'Tech Conference 2026'
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Lucknow Convention Center'
  })
  @IsString()
  location: string;

  @ApiPropertyOptional({
    example: 'Annual developer meetup'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '2026-06-20T10:00:00'
  })
  @IsDateString()
  eventDate: Date;

}