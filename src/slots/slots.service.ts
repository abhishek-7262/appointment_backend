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

  // Create multiple slots for the same date
  async createSlot(
    createSlotDto: CreateSlotDto,
    userId: string,
  ): Promise<Slot[]> {
    const { date, duration, slots } = createSlotDto;

    if (!slots || slots.length === 0) {
      throw new BadRequestException('Slots array cannot be empty');
    }

    const savedSlots: Slot[] = [];

    for (const slot of slots) {
      const { startTime, endTime } = slot;

      // Check for duplicate slot for the same user/date/time
      const existing = await this.slotModel.findOne({
        date,
        startTime,
        createdBy: userId,
      });

      if (existing) {
        throw new BadRequestException(
          `Slot from ${startTime} already exists for this date`,
        );
      }

      const newSlot = new this.slotModel({
        date,
        duration,
        startTime,
        endTime,
        createdBy: userId,
      });

      const saved = await newSlot.save();
      savedSlots.push(saved);

      // Cache in Redis
      await this.redis.set(`slot:${saved._id}`, JSON.stringify(saved));
    }

    return savedSlots;
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
