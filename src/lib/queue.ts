import { Queue } from "bullmq";
import IORedis from "ioredis";

import env from "@/env";

import { QUEUE } from "./constants";

const connection = new IORedis({
  port: env.REDIS_PORT,
  host: env.REDIS_HOST,
  maxRetriesPerRequest: null,
});

// Reuse the ioredis instance
const mailQueue = new Queue(QUEUE.email, {
  connection,
  defaultJobOptions: {
    removeOnComplete: {
      count: 1000, // keep up to 1000 jobs
      age: 24 * 3600, // keep up to 24 hours
    },
    removeOnFail: {
      age: 24 * 3600, // keep up to 24 hours
    },
  },
});

export { connection, mailQueue };
