import { faker } from "@faker-js/faker";
import { type Config } from "src/1-application/1-ports/env/Config";

const fromZeroSecondsToAYear = () => faker.number.int({ min: 0, max: 370 * 24 * 60 * 60 });

export const mockConfig = (): Config => ({
  jwtValiditySeconds: fromZeroSecondsToAYear(),
  refreshTokenValiditySeconds: fromZeroSecondsToAYear()
});
