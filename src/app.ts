import { startHttpServer } from "#presentation/server.js";
import {
  createQueues,
  consumeTestRequests,
} from "#application/rabbitmqService.js";
import { log } from "#infrastructure/log.js";
import { scheduleTestJob } from "#application/k8Service.js";

const start = async () => {
  try {
    await createQueues();
    await startHttpServer();
    setInterval(() => {
      log.info("Checking rabbitmq connection");
      consumeTestRequests(async (msg) => {
        log.info("Received test request", { msg });
        await scheduleTestJob(msg.id, msg.imageUrl);
      });
    });
  } catch (err) {
    log.fatal(err);
    process.exit(1);
  }
};

start();
