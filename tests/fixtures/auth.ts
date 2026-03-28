import { registerUser } from '../utils/api-helpers';
import { uniqueEmail, validInput } from '../utils/test-data';
import { test as base, expect } from './base';

type AuthFixtures = {
  registeredUser: {
    email: string;
    password: string;
  };
};

export const test = base.extend<AuthFixtures>({
  registeredUser: async ({ request, loginPage }, use) => {
    const email = uniqueEmail();
    const password = validInput.password;

    const user = await registerUser(request, email, password);

    await loginPage.goto();

    await use({ email, password });
  },
});

export { expect, validInput, uniqueEmail };
