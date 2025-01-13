import env from '@/env.js';
import { Queue, Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import IORedis from 'ioredis';

const connection = new IORedis({ maxRetriesPerRequest: null });

export const emailQueue = new Queue('emailQueue', { connection });


const transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD
    }
});

const emailWorker = new Worker(
    'emailQueue',
    async job => {
        const { to, subject, text } = job.data;
        await transporter.sendMail({
            from: 'honoapi@example.com',
            to,
            subject,
            text,
        });
        console.log(`Email sent to ${to}`);
    },
    { connection },
);

emailWorker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed: ${err.message}`);
});