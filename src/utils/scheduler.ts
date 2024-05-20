import { ConsumeMessage } from "amqplib";
import {
  connectRabbitMQ,
  consumeTestResults,
} from "#application/rabbitmqService.js";
import { scheduleTestJob } from "#application/k8Service.js";
import { log } from "#infrastructure/log.js";

export const startScheduler = () => {
  setInterval(async () => {
    await connectRabbitMQ();

    consumeTestResults(async (msg: ConsumeMessage | null) => {
      if (msg) {
        const testRequest = JSON.parse(msg.content.toString());
        log.info("Processing test request:", testRequest);

        await scheduleTestJob(testRequest.jobName, testRequest.dockerImage);
      }
    });
  }, 5000); // Poll every 5 seconds
};
