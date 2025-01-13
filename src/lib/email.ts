import env from '@/env.js';
import nodemailer from 'nodemailer';
import { logger } from './logger.js';


interface EmailOptions {
    to: string;            // Recipient email address
    subject: string;       // Email subject
    html?: string;         // HTML content of the email
    text?: string;         // Plain text content of the email
    from?: string;         // Sender email address (optional, defaults to the transporter config)
}

// Configure your email transporter
const transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD,
    },
});

export async function sendEmail({ from, to, subject, html, text }: EmailOptions): Promise<void> {
    try {

        const info = await transporter.sendMail({
            from, to, subject, html, text
        });

        logger.info(`Email sent: ${info.messageId}`);
    } catch (error) {
        logger.error('Error sending email:', error);
        throw error;
    }
}