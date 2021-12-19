import { FastifyTestEnvironment } from "./fastify.environment";
import { TestEnvironment } from "./test-environment";

export const createTestEnvironment = (): TestEnvironment => new FastifyTestEnvironment();