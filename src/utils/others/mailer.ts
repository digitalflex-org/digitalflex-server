import { clear } from 'console';
import nodemailer from 'nodemailer';

class Mailer {
  private transporter: nodemailer.Transporter;
  constructor() {
    //to use SMTP
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    } as nodemailer.TransportOptions);
  }

  static async sendResetLinkOrOtp(to: string, subject: string, resetLinkOrOtp: string | number) {
    const mailer = new Mailer();
    const mailOptions = {
      from: `"Support Team" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: `
                <h2>Password Reset</h2>
                <p>Click the link below to reset your password:</p>
                <a href="${resetLinkOrOtp}">${resetLinkOrOtp}</a>
            `,
    };

    try {
      const info = await mailer.transporter.sendMail(mailOptions);
      console.log('Reset Link/OTP email sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending Reset Link/OTP email:', error);
      throw error;
    }
  }

  static async sendActivationMessage(to: string, subject: string, activationLink: string) {
    const mailer = new Mailer();
    const mailOptions = {
      from: `"Activation Team" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: `
                <h2>Account Activation</h2>
                <p>Click the link below to activate your account:</p>
                <a href="${activationLink}">${activationLink}</a>
            `,
    };

    try {
      const info = await mailer.transporter.sendMail(mailOptions);
      console.log('Activation email sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending Activation email:', error);
      throw error;
    }
  }
  static async sendCompletionMessageToAccountManager(to: string, subject: string, userData: { name: string, email: string, preferred_name: string }) {
    const mailer = new Mailer();

    const mailOptions = {
      from: `"Activation Team" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: `
        <h2>Applicant Training Completion Notification 🎉</h2>
        <p>An applicant has completed training. Details below:</p>
        <ul style="list-style-type: none; padding: 0;">
          <li><strong>Name:</strong> ${userData.name}</li>
          <li><strong>Email:</strong> ${userData.email}</li>
          <li><strong>Preferred Name:</strong> ${userData.preferred_name}</li>
        </ul>
      `,
    };

    try {
      const info = await mailer.transporter.sendMail(mailOptions);
      console.log('Training completion email sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending training completion email:', error);
      throw error;
    }
  }
}

export default Mailer;
