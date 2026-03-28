import { test, validInput, uniqueEmail } from '../fixtures/auth';

test.describe('Register page', () => {
  test.beforeEach(async ({ registerPage }) => {
    await registerPage.gotoreg();
  });

  test('User can register with valid credentials', async ({
    registerPage,
    registrationData,
  }) => {
    await registerPage.register(
      registrationData.email,
      registrationData.password,
    );

    await registerPage.expectSuccess('Registration successful!');
  });

  test('User cannot register with existing valid credentials', async ({
    registerPage,
    registrationData,
  }) => {
    await registerPage.register(
      registrationData.email,
      registrationData.password,
    );
    await registerPage.expectSuccess('Registration successful!');

    await registerPage.gotoreg();

    await registerPage.register(
      registrationData.email,
      registrationData.password,
    );

    await registerPage.expectError('User already exists');
  });

  test('User cannot register without credentials', async ({ registerPage }) => {
    await registerPage.submit();

    await registerPage.expectError('Email is required');
  });

  test('User cannot register without email', async ({
    registerPage,
    registrationData,
  }) => {
    await registerPage.register('', registrationData.password);

    await registerPage.expectError('Email is required');
  });

  test('User cannot register without password', async ({
    registerPage,
    registrationData,
  }) => {
    await registerPage.register(registrationData.email, '');

    await registerPage.expectError('Password is required');
  });

  test('User cannot register without confirm password', async ({
    registerPage,
    registrationData,
  }) => {
    await registerPage.fillEmail(registrationData.email);
    await registerPage.fillPassword(registrationData.password);
    await registerPage.fillConfirmPassword('');
    await registerPage.submit();

    await registerPage.expectError('Confirm password is required');
  });

  test('User cannot register with not matching passwords', async ({
    registerPage,
    registrationData,
  }) => {
    await registerPage.fillEmail(registrationData.email);
    await registerPage.fillPassword(registrationData.password);
    await registerPage.fillConfirmPassword('testingthepass');
    await registerPage.submit();

    await registerPage.expectError('Passwords do not match');
  });
});
