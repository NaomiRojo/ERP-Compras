import { mock } from "bun:test"
import type { Verifiers } from "src/0-domain/Password";
import type { UserInfo } from "src/0-domain/User";
import { fakeUser } from "src/0-domain/User.spec";
import { type UserPort } from "src/1-application/1-ports/db/User";

export const mockUserPort: () => UserPort = () => ({
  createUser:      mock(() => fakeUser()),
  fetchByUserName: mock(() => fakeUser()),
  fetchByUUID:     mock(() => fakeUser())
});
