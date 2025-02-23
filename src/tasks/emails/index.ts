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
} as const;

type EmailTaskType = keyof typeof EMAILTASKS;

function isJobType<T extends EmailTaskType>(
  job: Job<EmailJobData[keyof EmailJobData]>,
  taskType: T
): job is Job<EmailJobData[T]> {
  return job.name === taskType;
}

async function processor(job: Job<EmailJobData[keyof EmailJobData]>) {
  switch (job.name) {
    case EMAILTASKS.SendWelcomeEmail:
      if (isJobType(job, EMAILTASKS.SendWelcomeEmail)) {
        await sendWelcomeEmail(job.data); // ✅ job.data is correctly inferred
      }
      break;

    case EMAILTASKS.SendActivationEmail:
      if (isJobType(job, EMAILTASKS.SendActivationEmail)) {
        await sendActivationEmail(job.data);
      }
      break;

    case EMAILTASKS.SendPasswordResetEmail:
      if (isJobType(job, EMAILTASKS.SendPasswordResetEmail)) {
        await sendPasswordResetEmail(job.data);
      }
      break;

    default:
      logger.warn(`Unhandled task: ${job.name}`);
  }
}

function createEmailTasker() {
  const setup = () => {
    // Type the worker with the email job data
    const mailWorker = new Worker<EmailJobData[keyof EmailJobData]>(
      QUEUE.email,
      processor,
      { connection }
    );

    mailWorker.on("completed", (job: Job) => {
      logger.info(`Job ${job.id} completed, task name: ${job.name}`);
    });

    mailWorker.on("failed", (job: Job | undefined, error: Error) => {
      if (job) {
        logger.error(
          `Job ${job.id} failed, task: ${job.name}, error: ${error.message}`
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

export { createEmailTasker, EMAILTASKS };
