// routes/testRequest/index.ts
import type { FastifyPluginAsync } from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import schema from "./schema.js";
import { sendTestRequestMessage } from "#application/rabbitmqService.js";
import { randomUUID } from "node:crypto";

const testRequestRoute: FastifyPluginAsync = async (fastify) => {
  const fastifyT = fastify.withTypeProvider<TypeBoxTypeProvider>();

  fastifyT.post(
    "/test-request",
    { schema: schema.createTestRequestSchema },
    async (request, reply) => {
      const testRequest = request.body;

      try {
        await sendTestRequestMessage({
          id: randomUUID(),
          createdAt: new Date().toISOString(),
          ...testRequest,
        });
        reply.send({ message: "Test request submitted successfully" });
      } catch (error) {
        reply.status(500).send({ message: "Failed to submit test request" });
      }
    },
  );
};

export default testRequestRoute;
