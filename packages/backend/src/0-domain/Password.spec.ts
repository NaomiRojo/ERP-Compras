import { type LoginSecrets, type RegisterSecrets, type Verifiers } from "./Password";
import { faker } from "@faker-js/faker";


export const fakeVerifiers = (): Verifiers => ({
  password: faker.internet.password()
});

export const fakeLoginSecrets = (): LoginSecrets => ({
  password: faker.internet.password()
});

export const fakeRegisterSecrets = (): RegisterSecrets => ({
  password: faker.internet.password()
});
