import { type Job, Worker } from "bullmq";

import { QUEUE } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { connection } from "@/lib/queue";

import sendActivationEmail from "./send-activation-email";
import sendPasswordResetEmail from "./send-password-reset-email";
import sendWelcomeEmail from "./send-welcome-email";

const EMAILTASKS = {
  SendWelcomeEmail: "SendWelcomeEmail",
  SendActivationEmail: "SendActivationEmail",
  SendPasswordResetEmail: "SendPasswordResetEmail",
};

function createEmailTasker() {
  const processor = async (job: Job) => {
    switch (job.name) {
      case EMAILTASKS.SendWelcomeEmail: {
        const { email, name } = job.data;
        await sendWelcomeEmail({ name, email });
        break;
      }
      case EMAILTASKS.SendActivationEmail: {
        const { email, otp } = job.data;
        await sendActivationEmail({ email, otp });
        break;
      }
      case EMAILTASKS.SendPasswordResetEmail: {
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
    const mailWorker = new Worker(QUEUE.email, processor, { connection });

    mailWorker.on("completed", (job: Job) => {
      logger.info(`Job ${job.id} completed, task name: ${job.name}`);
    });

    mailWorker.on("failed", (job: Job | undefined, error: Error) => {
      if (job) {
        logger.error(
          `Job ${job.id} failed, task name: ${job.name}, error: ${error.message}`
        );
      } else {
        logger.error(`Job failed, error: ${error.message}`);
      }
    });

    mailWorker.on("error", (err) => {
      logger.error(err);
    });

    return mailWorker;
  };

  return { setup };
}

export { createEmailTasker, TASK };
