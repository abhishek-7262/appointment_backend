import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from './bookings.schema';
import { Slot, SlotDocument } from 'src/slots/slots.schema';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Slot.name) private slotModel: Model<SlotDocument>,
  ) {}

  // ✅ Book a slot
  async bookSlot(userId: string, slotId: string): Promise<Booking> {
    const slot = await this.slotModel.findById(slotId);
    if (!slot) throw new NotFoundException('Slot not found');

    if (slot.isBooked)
      throw new BadRequestException('This slot is already booked');

    // Optional: prevent user from booking multiple times same slot
    const alreadyBooked = await this.bookingModel.findOne({
      slotId,
      userId,
      status: 'booked',
    });
    if (alreadyBooked) {
      throw new BadRequestException('You already booked this slot');
    }

    // Create booking
    const booking = await this.bookingModel.create({
      slotId,
      clinicId: slot.createdBy,
      userId,
      status: 'booked',
    });

    // Mark slot as booked
    slot.isBooked = true;
    await slot.save();

    return booking;
  }

  // ✅ Get all bookings for a user
  async getUserBookings(userId: string) {
    return this.bookingModel
      .find({ userId })
      .populate('slotId', 'date startTime endTime')
      .populate('clinicId', 'name email')
      .sort({ createdAt: -1 });
  }

  // ✅ Cancel booking
  async cancelBooking(userId: string, bookingId: string) {
    const booking = await this.bookingModel.findOne({ _id: bookingId, userId });
    if (!booking) throw new NotFoundException('Booking not found');

    booking.status = 'cancelled';
    await booking.save();

    // Free up the slot again
    await this.slotModel.findByIdAndUpdate(booking.slotId, { isBooked: false });

    return booking;
  }
}
