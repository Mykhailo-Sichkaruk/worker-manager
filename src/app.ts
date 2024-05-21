import { startHttpServer } from "#presentation/server.js";
import { createQueues } from "#application/rabbitmqService.js";
import { log } from "#infrastructure/log.js";
import { processRequest } from "#application/k8Service.js";

const start = async () => {
  try {
    await createQueues();
    await startHttpServer();
    log.info("Start repetative checking of test requests.");
    setInterval(async () => {
      await processRequest();
    }, 10000);
  } catch (err) {
    log.fatal(err);
    process.exit(1);
  }
};

start();
