import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSlotItemDto } from './create-slot-item.dto';

export class CreateSlotDto {
  @IsNotEmpty({ message: 'Date is required' })
  @IsString()
  date: string;

  @IsNotEmpty({ message: 'Duration is required' })
  @IsNumber()
  duration: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSlotItemDto)
  slots: CreateSlotItemDto[];
}
