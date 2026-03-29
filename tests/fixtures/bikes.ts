import { bikeStore } from '../../web/src/state/bike-store';
import {
  test as base,
  expect,
  uniqueEmail,
  validInput,
} from '../fixtures/auth';

type BikeFixtures = {
  loggedInUser: {
    email: string;
    password: string;
  };
  seededBike: {
    make: string;
    model: string;
    year: string;
  };
  garageWithOneBike: {
    make: string;
    model: string;
    year: string;
  };
};

export const test = base.extend<BikeFixtures>({
  loggedInUser: async ({ registerPage, loginPage }, use) => {
    const email = uniqueEmail();
    const password = validInput.password;

    await registerPage.gotoreg();
    await registerPage.register(email, password, password);
    await registerPage.expectSuccess('Registration successful!');

    await expect(loginPage.loginForm).toBeVisible();

    await loginPage.login(email, password);

    await use({ email, password });
  },

  garageWithOneBike: async ({ loggedInUser, bikesPage, seededBike }, use) => {
    const bike = seededBike;

    await bikesPage.addBike(bike);

    await use({ ...bike });
  },

  seededBike: async ({}, use) => {
    const suffix = Date.now().toString();

    const seededBike = {
      make: `Test-Make-${suffix}`,
      model: `Test-Model-${suffix}`,
      year: '2021',
    };
    await use(seededBike);
  },
});

export { expect, validInput, uniqueEmail };
