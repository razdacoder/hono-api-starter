import { type Job, Worker } from 'bullmq';
import { QUEUE, connection, defaultQueue } from '@/lib/queue.js';
import sendWelcomeEmail from './emails/sendWelcomeEmail.js';
import { logger } from '@/lib/logger.js';
import sendActivationEmail from './emails/sendActivationEmail.js';

const TASK = {
  SendWelcomeEmail: 'SendWelcomeEmail',
  SendActivationEmail: 'SendActivationEmail'
};

const createTasker = () => {
  const processor = async (job: Job) => {
    switch (job.name) {
      case TASK.SendWelcomeEmail: {
        await sendWelcomeEmail();
        break;
      }
      case TASK.SendActivationEmail: {
        const { email, otp } = job.data;
        await sendActivationEmail({email, otp});
        break;
      }
      default: {
        logger.warn(`Unhandled task: ${job.name}`);
      }
    }
  };

  const setup = () => {
    const worker = new Worker(QUEUE.default, processor, { connection });

    worker.on('completed', (job: Job) => {
      logger.info(`Job ${job.id} completed, task name: ${job.name}`);
    });

    worker.on('failed', (job: Job | undefined, error: Error) => {
      if (job) {
        logger.error(`Job ${job.id} failed, task name: ${job.name}, error: ${error.message}`);
      } else {
        logger.error(`Job failed, error: ${error.message}`);
      }
    });

    worker.on('error', (err) => {
      logger.error(err);
    });

    return worker;
  };

  return { setup };
};



export { TASK, createTasker };
