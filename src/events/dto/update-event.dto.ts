import {
  IsOptional,
  IsString,
  IsDateString
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEventDto {

  @ApiPropertyOptional({
    example: 'Tech Conference'
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: 'Delhi Expo Center'
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    example: 'Updated event description'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '2026-06-20T10:00:00'
  })
  @IsOptional()
  @IsDateString()
  eventDate?: Date;

}