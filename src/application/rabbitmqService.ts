import amqp, { Connection, Channel } from "amqplib";
import env from "#config/env.js";
import { log } from "#infrastructure/log.js";

let connection: Connection;
let channel: Channel;

export const connectRabbitMQ = async () => {
  connection = await amqp.connect(env.RABBITMQ_URL);
  channel = await connection.createChannel();

  log.info("Connected to RabbitMQ");

  return channel;
};

export const sendTestRequestMessage = async (message: any) => {
  await channel.assertQueue("test-requests", { durable: true });
  channel.sendToQueue("test-requests", Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};

export const consumeTestResults = async (callback: (msg: any) => void) => {
  await channel.assertQueue("result_queue", { durable: true });
  channel.consume("result_queue", (msg) => {
    if (msg !== null) {
      callback(msg);
      channel.ack(msg);
    }
  });
};

export const createQueues = async () => {
  await connectRabbitMQ();
  // Assert (create) the queues if they do not exist
  await channel.assertQueue("test-requests", { durable: true });
  await channel.assertQueue("result_queue", { durable: true });
  log.info("RabbitMQ queues created: [test-requests, result_queue]");
};
