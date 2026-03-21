import { type JwtPort } from "src/1-application/1-ports/crypto/Jwt";
import { mock } from "bun:test";
import { fakeClaims } from "src/0-domain/Claims.spec";
import { faker } from "@faker-js/faker";

export const mockJwtPort = (): JwtPort => ({
  newClaims: mock(fakeClaims),
  signJwt: mock(() => faker.internet.jwt()),
  verifyJwt: mock(fakeClaims)
});
