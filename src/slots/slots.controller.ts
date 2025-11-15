import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SlotsService } from './slots.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateSlotDto } from './dto/create-slot.dto';
import { GetSlotsDto } from './dto/getAll-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@UseInterceptors(CacheInterceptor)
@Controller('slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createSlot(@Body() createSlotDto: CreateSlotDto, @Request() req: any) {
    const userId = req.user._id;

    const slot = await this.slotsService.createSlot(createSlotDto, userId);

    return {
      message: 'Slot created successfully',
      data: slot,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('getAll')
  async getAllSlots(@Body() dto: GetSlotsDto) {
    return this.slotsService.getAllSlots(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateSlot(
    @Param('id') id: string,
    @Body() updateSlotDto: UpdateSlotDto,
    @Req() req,
  ) {
    const userId = req.user._id;
    return this.slotsService.updateSlot(id, updateSlotDto, userId);
  }

  @Get('std')
  async getStudents() {
    return this.slotsService.getStudents();
  }
}
