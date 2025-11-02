import { Type } from 'class-transformer';
import {
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  IsString,
} from 'class-validator';

export class GetSlotsDto {
  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'Start date must be a valid ISO date string (YYYY-MM-DD)',
    },
  )
  startDate?: string;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'End date must be a valid ISO date string (YYYY-MM-DD)',
    },
  )
  endDate?: string;

  @IsOptional()
  @IsString()
  createdBy?: string; // optional filter (clinic/doctor ID)

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1; // default page 1

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 10; // default 10 per page
}
