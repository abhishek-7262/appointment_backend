import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/users.schema';

export type SlotDocument = Slot & Document;

@Schema({ timestamps: true })
export class Slot {
  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  duration: number;

  @Prop([
    {
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
  ])
  slots: {
    startTime: string;
    endTime: string;
  }[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: User | Types.ObjectId; // Reference to the user who created the slots
}

export const SlotSchema = SchemaFactory.createForClass(Slot);
