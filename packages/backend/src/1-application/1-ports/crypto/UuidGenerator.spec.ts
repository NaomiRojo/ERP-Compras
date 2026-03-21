import { type UuidGenerator } from "src/1-application/1-ports/crypto/UuidGenerator";
import { mock } from "bun:test";
import { faker } from "@faker-js/faker";

export const mockUuidGenerator: () => UuidGenerator = () => ({
  generate: mock(() => faker.string.uuid())
});
