import { faker } from "@faker-js/faker";
import { type Claims } from "./Claims";

export const fakeClaims = (): Claims => ({
  sub: faker.string.uuid(),
  iat: faker.date.recent().toISOString(),
  nbf: faker.date.recent().toISOString(),
  exp: faker.date.soon().toISOString(),
});
