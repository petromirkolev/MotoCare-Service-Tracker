import { registerUser } from '../utils/api-helpers';
import { uniqueEmail, validInput } from '../utils/test-data';
import { test as base, expect } from './base';

type AuthFixtures = {
  registrationData: {
    email: string;
    password: string;
  };

  registeredUser: {
    email: string;
    password: string;
  };
};

export const test = base.extend<AuthFixtures>({
  registrationData: async ({}, use) => {
    const email = uniqueEmail();
    const password = validInput.password;

    await use({ email, password });
  },

  registeredUser: async ({ request }, use) => {
    const email = uniqueEmail();
    const password = validInput.password;

    await registerUser(request, email, password);

    await use({ email, password });
  },
});

export { expect, validInput, uniqueEmail };
