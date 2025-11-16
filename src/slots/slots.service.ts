import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Slot, SlotDocument } from './slots.schema';
import { Model } from 'mongoose';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { GetSlotsDto } from './dto/getAll-slot.dto';
import Redis from 'ioredis';

@Injectable()
export class SlotsService {
  constructor(
    @InjectModel(Slot.name) private slotModel: Model<SlotDocument>,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  // ✅ Create single slot (for a specific date/time)
  async createSlot(
    createSlotDto: CreateSlotDto,
    userId: string,
  ): Promise<Slot> {
    const { date, startTime, endTime } = createSlotDto;

    // Prevent duplicate slot creation for same time
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

    const savedSlot = await newSlot.save();

    //redis
    await this.redis.set(`slot:${savedSlot._id}`, JSON.stringify(savedSlot));

    return savedSlot;
  }

  //  Paginated and filtered slots list
  async getAllSlots(dto: GetSlotsDto): Promise<any> {
    const { startDate, endDate, page = 1, limit = 10, createdBy } = dto;

    const filter: any = {};

    //  Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    // filter by clinic/doctor
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

  // Update slot details
  async updateSlot(id: string, updateSlotDto: UpdateSlotDto, userId: string) {
    const slot = await this.slotModel.findById(id);
    if (!slot) throw new NotFoundException('Slot not found');

    if (slot.createdBy.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to update this slot');
    }

    //prevent editing a booked slot
    if (slot.isBooked) {
      throw new BadRequestException('Cannot update a booked slot');
    }

    Object.assign(slot, updateSlotDto);
    return await slot.save();
  }

  // Delete slot
  async deleteSlot(id: string, userId: string) {
    const slot = await this.slotModel.findById(id);
    if (!slot) throw new NotFoundException('Slot not found');

    if (slot.createdBy.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to delete this slot');
    }

    // prevent deleting booked slots
    if (slot.isBooked) {
      throw new BadRequestException('Cannot delete a booked slot');
    }

    await this.slotModel.findByIdAndDelete(id);
    return { message: 'Slot deleted successfully' };
  }
}
