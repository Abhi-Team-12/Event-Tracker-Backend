import {
  IsOptional,
  IsNumber,
  IsString
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FilterEventsDto {

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number for pagination'
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of records per page'
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    example: 'conference',
    description: 'Search by event title, location or description'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'upcoming',
    description: 'Filter by status: upcoming or past'
  })
  @IsOptional()
  @IsString()
  status?: string;

}