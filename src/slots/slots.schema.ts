import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/users.schema';

export type SlotDocument = Slot & Document;

// Subdocument schema for individual slots
@Schema({ _id: false }) // prevents extra _id for each sub-slot
export class SubSlot {
  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;
}

export const SubSlotSchema = SchemaFactory.createForClass(SubSlot);

// Main Slot schema
@Schema({ timestamps: true })
export class Slot {
  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  duration: number;

  @Prop({ type: [SubSlotSchema], required: true })
  slots: SubSlot[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: User | Types.ObjectId;
}

export const SlotSchema = SchemaFactory.createForClass(Slot);
