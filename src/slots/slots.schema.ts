import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/users.schema';

export type SlotDocument = Slot & Document;

@Schema({ timestamps: true })
export class Slot {
  @Prop({ required: true })
  date: string; // e.g. "2025-12-01"

  @Prop({ required: true })
  startTime: string; // e.g. "10:00"

  @Prop({ required: true })
  endTime: string; // e.g. "10:30"

  @Prop({ required: true })
  duration: number; // in minutes, e.g. 30

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: User | Types.ObjectId; // clinic/admin who created the slot

  @Prop({ default: false })
  isBooked: boolean; // marks if booked or not
}

export const SlotSchema = SchemaFactory.createForClass(Slot);
