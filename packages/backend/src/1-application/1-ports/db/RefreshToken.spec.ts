import { RefreshToken } from "src/0-domain/RefreshToken";
import { mock } from "bun:test";
import { fakeRefreshToken } from "src/0-domain/RefreshToken.spec";
import { type RefreshTokenPort } from "src/1-application/1-ports/db/RefreshToken";
import { fakeUser } from "src/0-domain/User.spec";
import { faker } from "@faker-js/faker";

export const mockRefreshTokenPort: () => RefreshTokenPort = () => ({
  issueRefreshToken:  mock(fakeRefreshToken),
  expireRefreshToken: mock(fakeRefreshToken),
  findUser: mock(fakeUser),
  findToken: mock(fakeRefreshToken),
  isExpired: mock(() => faker.datatype.boolean())
});
