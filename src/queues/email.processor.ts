// src/queues/email.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from '../mail/mail.service';

@Processor('email-queue')
export class EmailProcessor extends WorkerHost {
  constructor(private mailService: MailService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'send-admin-mail') {
      return this.mailService.sendAdminEmail(job.data);
    }

    if (job.name === 'send-user-reminder') {
      return this.mailService.sendUserReminder(job.data);
    }
  }
}
