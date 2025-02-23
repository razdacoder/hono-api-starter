import { Queue } from "bullmq";
import IORedis from "ioredis";

import env from "@/env";

import { QUEUE } from "./constants";

const connection = new IORedis({
  port: env.REDIS_PORT,
  host: env.REDIS_HOST,
  maxRetriesPerRequest: null,
});

const defaultJobOptions = {
  removeOnComplete: {
    count: 1000, // keep up to 1000 jobs
    age: 24 * 3600, // keep up to 24 hours
  },
  removeOnFail: {
    age: 24 * 3600, // keep up to 24 hours
  },
};

// Reuse the ioredis instance
const mailQueue = new Queue<EmailJobData[keyof EmailJobData]>(QUEUE.email, {
  connection,
  defaultJobOptions,
});

async function addEmailJob<T extends keyof EmailJobData>(
  taskName: T,
  data: EmailJobData[T],
  options?: { delay?: number; priority?: number }
) {
  await mailQueue.add(taskName, data, options);
}

export { addEmailJob, connection, mailQueue };
