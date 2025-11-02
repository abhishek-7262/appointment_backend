import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateSlotDto {
  @IsNotEmpty({ message: 'Date is required' })
  @IsString()
  date: string; // e.g. "2025-12-01"

  @IsNotEmpty({ message: 'Start time is required' })
  @IsString()
  startTime: string; // e.g. "10:00"

  @IsNotEmpty({ message: 'End time is required' })
  @IsString()
  endTime: string; // e.g. "10:30"

  @IsNotEmpty({ message: 'Duration is required' })
  @IsNumber()
  duration: number; // in minutes (e.g. 30)

  @IsOptional()
  @IsBoolean()
  isBooked?: boolean; // optional, defaults to false in schema
}
