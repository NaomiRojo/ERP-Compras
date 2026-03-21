import { faker } from "@faker-js/faker";
import { mock } from "bun:test";
import { fakeVerifiers } from "src/0-domain/Password.spec";
import { type PasswordChecking } from "src/1-application/1-ports/crypto/PasswordChecking";

export const mockPasswordChecking = (): PasswordChecking => ({
  check: mock(() => faker.datatype.boolean()),
  generate: mock(fakeVerifiers),
  change: mock(fakeVerifiers)
});
