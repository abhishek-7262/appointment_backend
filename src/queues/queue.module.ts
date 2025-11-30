// src/queues/queue.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailProcessor } from './email.processor';
import { EmailQueue } from './email.queue';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    MailModule,
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),

    // Register queues
    BullModule.registerQueue({
      name: 'email-queue',
    }),
  ],
  providers: [EmailProcessor, EmailQueue],
  exports: [EmailQueue],
})
export class QueueModule {}
