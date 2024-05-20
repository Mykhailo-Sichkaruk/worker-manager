import { startHttpServer } from "#presentation/server.js";
import { connectRabbitMQ, createQueues } from "#application/rabbitmqService.js";
import { log } from "#infrastructure/log.js";

const start = async () => {
  try {
    await createQueues();
    await connectRabbitMQ();
    log.info("Connected to RabbitMQ");

    await startHttpServer();
  } catch (err) {
    log.fatal(err);
    process.exit(1);
  }
};

start();
