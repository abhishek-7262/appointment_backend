import {
  Controller,
  Post,
  Param,
  Req,
  Get,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // ✅ Book a slot
  @UseGuards(JwtAuthGuard)
  @Post(':slotId')
  async bookSlot(@Param('slotId') slotId: string, @Req() req) {
    const userId = req.user._id; // assumes JWT auth middleware
    return this.bookingsService.bookSlot(userId, slotId);
  }

  // ✅ Get user bookings
  @Get()
  async getUserBookings(@Req() req) {
    const userId = req.user._id;
    return this.bookingsService.getUserBookings(userId);
  }

  // ✅ Cancel booking
  @Delete(':bookingId')
  async cancelBooking(@Param('bookingId') bookingId: string, @Req() req) {
    const userId = req.user._id;
    return this.bookingsService.cancelBooking(userId, bookingId);
  }
}
