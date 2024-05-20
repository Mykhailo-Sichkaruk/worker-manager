import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { scheduleTestJob } from "#application/k8Service.js";
import { sendTestRequestMessage } from "#application/rabbitmqService.js";

interface TestRequest {
  id: string;
  dockerImage: string;
  interval: number;
  repeat: number;
  additionalInfo?: string;
}

export default async function testRequestRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/test-request",
    async (
      request: FastifyRequest<{ Body: TestRequest }>,
      reply: FastifyReply,
    ) => {
      const testRequest = request.body;
      try {
        await sendTestRequestMessage(testRequest);
        await scheduleTestJob(testRequest.id, testRequest.dockerImage);
        reply.send({ status: "Test request submitted successfully" });
      } catch (error) {
        reply.status(500).send({ error: "Failed to submit test request" });
      }
    },
  );
}
