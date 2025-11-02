import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Slot, SlotDocument } from './slots.schema';
import { Model } from 'mongoose';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { GetSlotsDto } from './dto/getAll-slot.dto';

@Injectable()
export class SlotsService {
  constructor(@InjectModel(Slot.name) private slotModel: Model<SlotDocument>) {}

  // ✅ Create single slot (for a specific date/time)
  async createSlot(
    createSlotDto: CreateSlotDto,
    userId: string,
  ): Promise<Slot> {
    const { date, startTime, endTime } = createSlotDto;

    // 🧠 Optional: Prevent duplicate slot creation for same time
    const existing = await this.slotModel.findOne({
      date,
      startTime,
      createdBy: userId,
    });
    if (existing) {
      throw new BadRequestException('Slot for this time already exists');
    }

    const newSlot = new this.slotModel({
      ...createSlotDto,
      createdBy: userId,
    });

    return await newSlot.save();
  }

  // ✅ Paginated and filtered slots list
  async getAllSlots(dto: GetSlotsDto): Promise<any> {
    const { startDate, endDate, page = 1, limit = 10, createdBy } = dto;

    const filter: any = {};

    // 🧠 Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    // 🧠 Optional: filter by clinic/doctor
    if (createdBy) {
      filter.createdBy = createdBy;
    }

    const skip = (page - 1) * limit;

    const [total, slots] = await Promise.all([
      this.slotModel.countDocuments(filter),
      this.slotModel
        .find(filter)
        .sort({ date: 1, startTime: 1 })
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

  // ✅ Update slot details (only creator can do it)
  async updateSlot(id: string, updateSlotDto: UpdateSlotDto, userId: string) {
    const slot = await this.slotModel.findById(id);
    if (!slot) throw new NotFoundException('Slot not found');

    if (slot.createdBy.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to update this slot');
    }

    // 🧠 Optional: prevent editing a booked slot
    if (slot.isBooked) {
      throw new BadRequestException('Cannot update a booked slot');
    }

    Object.assign(slot, updateSlotDto);
    return await slot.save();
  }

  // ✅ Optional: Delete slot (for future use)
  async deleteSlot(id: string, userId: string) {
    const slot = await this.slotModel.findById(id);
    if (!slot) throw new NotFoundException('Slot not found');

    if (slot.createdBy.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to delete this slot');
    }

    // 🧠 Optional: prevent deleting booked slots
    if (slot.isBooked) {
      throw new BadRequestException('Cannot delete a booked slot');
    }

    await this.slotModel.findByIdAndDelete(id);
    return { message: 'Slot deleted successfully' };
  }
}
