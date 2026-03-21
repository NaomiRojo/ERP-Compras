import { User, type UserInfo } from "./User";
import { fakeVerifiers } from "./Password.spec";
import { faker } from "@faker-js/faker";

export const fakeUserInfo: () => UserInfo = () => ({
  userName: faker.internet.username()
});

export const fakeUser: () => User = () => (new User(
  faker.string.uuid(),
  fakeUserInfo(),
  fakeVerifiers()
));
