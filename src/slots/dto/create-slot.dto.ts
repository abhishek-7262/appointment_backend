import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested, IsNumber, ArrayMinSize } from 'class-validator';

export class SlotDto {
  @IsNotEmpty({ message: 'Start time is required' })
  @IsString()
  startTime: string;

  @IsNotEmpty({ message: 'End time is required' })
  @IsString()
  endTime: string;
}

export class CreateSlotDto {
  @IsNotEmpty({ message: 'Date is required' })
  @IsString()
  date: string;

  @IsNotEmpty({ message: 'Duration is required' })
  @IsNumber()
  duration: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one slot is required' })
  @ValidateNested({ each: true })
  @Type(() => SlotDto)
  slots: SlotDto[];
}
