import { Injectable, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter;

  onModuleInit() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendAdminEmail(data: any) {
    await this.transporter.sendMail({
      from: `"Clinic System" <${process.env.SMTP_USER}>`,
      to: 'admin@example.com',
      subject: 'New Slot Booking',
      html: `
        <h3>New Booking Created</h3>
        <p>User: ${data.userId}</p>
        <p>Slot Date: ${data.slotDate}</p>
        <p>Time: ${data.startTime} - ${data.endTime}</p>
      `,
    });
  }

  async sendUserReminder(data: any) {
    await this.transporter.sendMail({
      from: `"Clinic System" <${process.env.SMTP_USER}>`,
      to: data.userEmail,
      subject: 'Appointment Reminder: 1 hour left',
      html: `
        <h3>Reminder</h3>
        <p>Your appointment starts at <b>${data.startTime}</b></p>
        <p>Date: ${data.slotDate}</p>
      `,
    });
  }
}
