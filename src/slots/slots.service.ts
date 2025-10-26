import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Slot, SlotDocument } from './slots.schema';
import { Model } from 'mongoose';
import { CreateSlotDto } from './dto/create-slot.dto';
import { GetSlotsDto } from './dto/getAll-slot.dto';

@Injectable()
export class SlotsService {
  constructor(@InjectModel(Slot.name) private SlotModel: Model<SlotDocument>) {}

  async createSlot(
    createSlotDto: CreateSlotDto,
    userId: string,
  ): Promise<Slot> {
    const newSlot = new this.SlotModel({
      ...createSlotDto,
      createdBy: userId,
    });

    return await newSlot.save();
  }

  async getAllSlots(dto: GetSlotsDto): Promise<any> {
    const { startDate, endDate, page = 1, limit = 10 } = dto;

    const filter: any = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const skip = (page - 1) * limit;

    const [total, slots] = await Promise.all([
      this.SlotModel.countDocuments(filter),
      this.SlotModel.find(filter)
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email role')
        .exec(),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: slots,
    };
  }
}
