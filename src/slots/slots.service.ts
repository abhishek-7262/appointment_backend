import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Slot, SlotDocument } from './slots.schema';
import { Model } from 'mongoose';
import { CreateSlotDto } from './dto/create-slot.dto';

@Injectable()
export class SlotsService {
    constructor(@InjectModel(Slot.name) private SlotModel:Model<SlotDocument>){}

    async createSlot(createSlotDto:CreateSlotDto,userId:string):Promise<Slot>{
        const newSlot=new this.SlotModel({
            ...createSlotDto,
            createdBy:userId
        });

        return await newSlot.save()
    }
}
