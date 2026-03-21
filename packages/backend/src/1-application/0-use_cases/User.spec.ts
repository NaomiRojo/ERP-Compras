import { expect, test, beforeEach, type Mock } from "bun:test";
import { register } from "./User";
import { faker } from "@faker-js/faker";
import { mockPasswordChecking } from "../1-ports/crypto/PasswordChecking.spec";
import { mockUserPort } from "../1-ports/db/User.spec";
import { fakeUser, fakeUserInfo } from "src/0-domain/User.spec";
import { fakeRegisterSecrets, fakeVerifiers } from "src/0-domain/Password.spec";
import type { PasswordChecking } from "../1-ports/crypto/PasswordChecking";

beforeEach(() => {
  faker.seed();
});

const assertMockFn = <T extends (...args: any[]) => any>(t: T): Mock<T> => t as unknown as Mock<T>;

test("Register Creates a user with Generated Verifiers", () => {
  const generatedVerifier = fakeVerifiers();
  const pwdChecking = mockPasswordChecking();
  pwdChecking.generate = assertMockFn(pwdChecking.generate).mockReturnValue(generatedVerifier);

  const generatedUser = fakeUser();
  const userPort = mockUserPort();
  userPort.createUser = assertMockFn(userPort.createUser).mockReturnValue(generatedUser);
 

  const registerInst = register(pwdChecking,userPort);
  
  const userInfo = fakeUserInfo();
  const registerSecrets = fakeRegisterSecrets();

  const ret = registerInst(userInfo,registerSecrets);

  expect(pwdChecking.generate).toHaveBeenCalledWith(registerSecrets);
  expect(pwdChecking.generate).toHaveBeenCalledTimes(1);
  expect(userPort.createUser).toHaveBeenCalledWith(userInfo,generatedVerifier);
  expect(userPort.createUser).toHaveBeenCalledTimes(1);
  expect(ret).toEqual(generatedUser);
});
