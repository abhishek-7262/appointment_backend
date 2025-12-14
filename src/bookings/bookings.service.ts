import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from './bookings.schema';
import { Slot, SlotDocument } from 'src/slots/slots.schema';
import { EmailQueue } from 'src/queues/email.queue';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Slot.name) private slotModel: Model<SlotDocument>,
    private readonly emailQueue: EmailQueue,
  ) {}

  // ✅ Book a slot
  // async bookSlot(userId: string, slotId: string): Promise<Booking> {
  //   const slot = await this.slotModel.findById(slotId);
  //   if (!slot) throw new NotFoundException('Slot not found');

  //   if (slot.isBooked)
  //     throw new BadRequestException('This slot is already booked');

  //   // Optional: prevent user from booking multiple times same slot
  //   const alreadyBooked = await this.bookingModel.findOne({
  //     slotId,
  //     userId,
  //     status: 'booked',
  //   });
  //   if (alreadyBooked) {
  //     throw new BadRequestException('You already booked this slot');
  //   }

  //   // Create booking
  //   const booking = await this.bookingModel.create({
  //     slotId,
  //     clinicId: slot.createdBy,
  //     userId,
  //     status: 'booked',
  //   });

  //   // Mark slot as booked
  //   slot.isBooked = true;
  //   await slot.save();

  //   // Send email to admin immediately
  //   await this.emailQueue.sendAdminMail({
  //     bookingId: booking._id,
  //     userId,
  //     slotId,
  //     clinicId: slot.createdBy,
  //     slotDate: slot.date,
  //     startTime: slot.startTime,
  //     endTime: slot.endTime,
  //   });

  //   // Schedule user reminder (1 hour before slot time)
  //   const appointmentDate = new Date(slot.date);
  //   const appointmentStart = new Date(
  //     appointmentDate.toDateString() + ' ' + slot.startTime,
  //   );

  //   const reminderTime = new Date(appointmentStart.getTime() - 60 * 60 * 1000);

  //   await this.emailQueue.scheduleUserReminder(
  //     {
  //       bookingId: booking._id,
  //       userId,
  //       userEmail: 'myemailg61@gmail.com', // ensure you store user email
  //       slotDate: slot.date,
  //       startTime: slot.startTime,
  //     },
  //     reminderTime,
  //   );

  //   return booking;
  // }

  async bookSlot(userId: string, slotId: string): Promise<Booking> {
    const session = await this.bookingModel.db.startSession();
    session.startTransaction();

    try {
      // 1️⃣ Check if user already booked this slot
      const alreadyBooked = await this.bookingModel.findOne(
        { slotId, userId, status: 'booked' },
        null,
        { session },
      );
      if (alreadyBooked) {
        throw new BadRequestException('You already booked this slot');
      }

      // 2️⃣ Atomically find the slot that is not booked and mark it booked
      const slot = await this.slotModel.findOneAndUpdate(
        { _id: slotId, isBooked: false },
        { $set: { isBooked: true } },
        { new: true, session },
      );

      if (!slot) {
        throw new BadRequestException('This slot is already booked');
      }

      // 3️⃣ Create the booking
      const booking = await this.bookingModel.create(
        [
          {
            slotId,
            clinicId: slot.createdBy,
            userId,
            status: 'booked',
          },
        ],
        { session },
      );

      // 4️⃣ Commit the transaction
      await session.commitTransaction();
      session.endSession();

      const createdBooking = booking[0];

      // 5️⃣ Send emails (outside transaction)
      await this.emailQueue.sendAdminMail({
        bookingId: createdBooking._id,
        userId,
        slotId,
        clinicId: slot.createdBy,
        slotDate: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });

      const appointmentDate = new Date(slot.date);
      const appointmentStart = new Date(
        appointmentDate.toDateString() + ' ' + slot.startTime,
      );

      const reminderTime = new Date(
        appointmentStart.getTime() - 60 * 60 * 1000,
      );

      await this.emailQueue.scheduleUserReminder(
        {
          bookingId: createdBooking._id,
          userId,
          userEmail: 'myemailg61@gmail.com',
          slotDate: slot.date,
          startTime: slot.startTime,
        },
        reminderTime,
      );

      return createdBooking;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
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
