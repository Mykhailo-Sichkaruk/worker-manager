import { Type } from "@sinclair/typebox";
import { RepeatPolicy, TestItem, Summary } from "#domain/test/index.js";

// Test Request DTO
export const TestRequestDTO = Type.Object({
  project: Type.String(),
  commitHash: Type.String(),
  imageUrl: Type.String(),
  repeatPolicy: RepeatPolicy,
});

// Test Result DTO
export const TestResultDTO = Type.Object({
  project: Type.String(),
  commitHash: Type.String(),
  imageUrl: Type.String(),
  status: Type.String(),
  executedAt: Type.String({ format: "date-time" }),
  testItems: Type.Array(TestItem),
});

// Test Report DTO
export const TestReportDTO = Type.Object({
  testResultId: Type.String({ format: "uuid" }),
  summary: Summary,
  createdAt: Type.String({ format: "date-time" }),
});

export const ErrorResponseDTO = Type.Object({
  message: Type.String(),
});
