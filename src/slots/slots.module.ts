import { Module } from '@nestjs/common';
import { SlotsController } from './slots.controller';
import { SlotsService } from './slots.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SlotSchema } from './slots.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name:"Slot",schema:SlotSchema}
    ]),
    AuthModule,
  ],
  controllers: [SlotsController],
  providers: [SlotsService]
})
export class SlotsModule {}
