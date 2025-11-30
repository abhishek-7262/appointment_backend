// src/mail/mail.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;

  onModuleInit() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // secure:true for port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendAdminEmail(data: any) {
    await this.transporter.sendMail({
      from: `"Appointment System" <${process.env.SMTP_USER}>`,
      to: 'admin@example.com',
      subject: 'New Appointment Booked',
      html: `
        <h3>New Appointment</h3>
        <p><strong>User:</strong> ${data.user}</p>
        <p><strong>Appointment Time:</strong> ${data.time}</p>
      `,
    });

    console.log('Admin email sent:', data);
  }

  async sendUserReminder(data: any) {
    await this.transporter.sendMail({
      from: `"Appointment System" <${process.env.SMTP_USER}>`,
      to: data.userEmail,
      subject: 'Appointment Reminder (1 hour left)',
      html: `
        <h3>Reminder</h3>
        <p>Your appointment is in <b>1 hour</b>.</p>
        <p><strong>Appointment ID:</strong> ${data.appointmentId}</p>
      `,
    });

    console.log('User reminder email sent:', data);
  }
}
