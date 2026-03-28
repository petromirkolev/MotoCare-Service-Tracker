import { test, expect, validInput } from '../fixtures/auth';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('Login is successful with valid email and valid password', async ({
    registeredUser,
    loginPage,
    bikesPage,
  }) => {
    await loginPage.login(registeredUser.email, registeredUser.password);

    await loginPage.expectSuccess('Login success, opening garage...');

    await expect(bikesPage.pageBikes).toBeVisible();
  });

  test('Login is rejected with missing email', async ({ loginPage }) => {
    await loginPage.login('', validInput.password);

    await loginPage.expectError('Email is required');

    await expect(loginPage.loginForm).toBeVisible();
  });

  test('Login is rejected with missing password', async ({
    loginPage,
    registeredUser,
  }) => {
    await loginPage.login(registeredUser.email, '');

    await loginPage.expectError('Password is required');

    await expect(loginPage.loginForm).toBeVisible();
  });

  test('Login is rejected with wrong password', async ({
    loginPage,
    registeredUser,
  }) => {
    await loginPage.login(registeredUser.email, '12344321');

    await loginPage.expectError('Invalid credentials');

    await expect(loginPage.loginForm).toBeVisible();
  });

  test('Login is rejected with non-existing user', async ({ loginPage }) => {
    await loginPage.login('nonexistingemail@test.com', '12345678');

    await loginPage.expectError('Invalid credentials');

    await expect(loginPage.loginForm).toBeVisible();
  });
});
