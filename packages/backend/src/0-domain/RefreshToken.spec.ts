import { faker } from "@faker-js/faker";
import { RefreshToken } from "./RefreshToken";

const fakeBytes = () => crypto.getRandomValues(new Uint8Array(
  crypto.getRandomValues(new Uint8Array(1))[0]!
));

export const fakeRefreshToken = () => new RefreshToken(
  fakeBytes(),
  faker.datatype.boolean(),
  faker.date.anytime()
);
