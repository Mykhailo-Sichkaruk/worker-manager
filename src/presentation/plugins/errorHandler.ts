import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { log } from "#infrastructure/log.js";
import { StatusCodes as SC } from "http-status-codes";

async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error.code === "FST_ERR_VALIDATION") {
    return await reply
      .code(error.statusCode ?? SC.INTERNAL_SERVER_ERROR)
      .send({ message: error.message });
  } else {
    log.fatal(error, "Unhandled error");
    request.log.error(error);
    return await reply.status(SC.INTERNAL_SERVER_ERROR).send({
      message:
        "Something went wrong on the server, please try again later, we are working on it.",
    });
  }
}

export default errorHandler;
