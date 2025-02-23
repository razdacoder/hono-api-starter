import dayjs from "dayjs";
import pinoLogger from "pino";

export const logger = pinoLogger({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format()}"`,
});
