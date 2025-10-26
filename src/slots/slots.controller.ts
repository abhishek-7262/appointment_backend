import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { SlotsService } from './slots.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateSlotDto } from './dto/create-slot.dto';

@Controller('slots')
export class SlotsController {
    constructor(private readonly slotsService:SlotsService){}

    @UseGuards(JwtAuthGuard)
    @Post()
    async createSlot(
        @Body() createSlotDto:CreateSlotDto,
        @Request() req:any
    ){
        const userId=req.user._id;

        const slot=await this.slotsService.createSlot(createSlotDto,userId);

         return {
            message: 'Slot created successfully',
            data: slot,
        };
    }
}
