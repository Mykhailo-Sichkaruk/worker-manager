import { TestRequestDTO, ErrorResponseDTO } from "#application/dto.js";

const createTestRequestSchema = {
  operationId: "createTestRequest",
  title: "Create Test Request",
  description: "Endpoint to create a test request",
  body: TestRequestDTO,
  response: {
    200: { type: "null" },
    500: ErrorResponseDTO,
  },
  tags: ["testRequest"],
};

export default {
  createTestRequestSchema,
};
