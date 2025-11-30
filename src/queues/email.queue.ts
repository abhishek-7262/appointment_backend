// src/queues/email.queue.ts
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailQueue {
  constructor(@InjectQueue('email-queue') private readonly emailQueue: Queue) {}

  async sendAdminMail(data: any) {
    await this.emailQueue.add('send-admin-mail', data);
  }

  async scheduleUserReminder(data: any, runAt: Date) {
    await this.emailQueue.add('send-user-reminder', data, {
      delay: runAt.getTime() - Date.now(), // delay until the reminder time
      removeOnComplete: true,
    });
  }
}
