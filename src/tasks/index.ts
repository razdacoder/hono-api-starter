import { type Job, Worker } from "bullmq";

import { logger } from "@/lib/logger.js";
import { connection, QUEUE } from "@/lib/queue.js";

import sendActivationEmail from "./emails/send-activation-email.js";
import sendPasswordResetEmail from "./emails/send-password-reset-email.js";
import sendWelcomeEmail from "./emails/send-welcome-email.js";

const TASK = {
  SendWelcomeEmail: "SendWelcomeEmail",
  SendActivationEmail: "SendActivationEmail",
  SendPasswordResetEmail: "SendPasswordResetEmail",
};

function createTasker() {
  const processor = async (job: Job) => {
    switch (job.name) {
      case TASK.SendWelcomeEmail: {
        const { email, name } = job.data;
        await sendWelcomeEmail({ name, email });
        break;
      }
      case TASK.SendActivationEmail: {
        const { email, otp } = job.data;
        await sendActivationEmail({ email, otp });
        break;
      }
      case TASK.SendPasswordResetEmail: {
        const { email, otp, name } = job.data;
        await sendPasswordResetEmail({ email, otp, name });
        break;
      }
      default: {
        logger.warn(`Unhandled task: ${job.name}`);
      }
    }
  };

  const setup = () => {
    const worker = new Worker(QUEUE.default, processor, { connection });

    worker.on("completed", (job: Job) => {
      logger.info(`Job ${job.id} completed, task name: ${job.name}`);
    });

    worker.on("failed", (job: Job | undefined, error: Error) => {
      if (job) {
        logger.error(
          `Job ${job.id} failed, task name: ${job.name}, error: ${error.message}`,
        );
      }
      else {
        logger.error(`Job failed, error: ${error.message}`);
      }
    });

    worker.on("error", (err) => {
      logger.error(err);
    });

    return worker;
  };

  return { setup };
}

export { createTasker, TASK };
