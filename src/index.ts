import { type ProcessMessage, ProcessMessagesType } from "#ipcMessages.js";
import type { Worker } from "node:cluster";
import cluster from "node:cluster";
import EventEmitter from "node:events";

const children: Worker[] = [];
const eventEmitter = new EventEmitter();

const createWorker = () => {
  const worker = cluster.fork();
  children.push(worker);
  worker.on("message", (message: ProcessMessage) => {
    if (message.status === ProcessMessagesType.EXITING) {
      eventEmitter.emit("restarted");
    }
  });

  return worker;
};

const run = () => {
  console.warn("Start app");
  createWorker();
  eventEmitter.on("restarted", () => {
    createWorker();
  });
};

if (cluster.isPrimary) {
  run();
} else {
  await import("./app.js");
}
