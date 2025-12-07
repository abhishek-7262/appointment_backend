import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSlotItemDto {
  @IsNotEmpty({ message: 'Start time is required' })
  @IsString()
  startTime: string;

  @IsNotEmpty({ message: 'End time is required' })
  @IsString()
  endTime: string;
}
