import nodemailer from 'nodemailer';

class Mailer {
    private transporter: nodemailer.Transporter;
    constructor() {
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
}

export default Mailer;
