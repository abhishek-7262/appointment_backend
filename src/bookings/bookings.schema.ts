import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Slot } from 'src/slots/slots.schema';
import { User } from 'src/users/users.schema';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'Slot', required: true })
  slotId: Slot | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: User | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  clinicId: User | Types.ObjectId;

  @Prop({ default: 'booked', enum: ['booked', 'cancelled'] })
  status: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
