// import { test, expect } from '@playwright/test';
// import { LoginPage } from '../pages/login-page';
// import { RegisterPage } from '../pages/register-page';
// import {
//   validInput,
//   invalidEmailInput,
//   invalidPasswordInput,
// } from '../utils/test-data';

// const seededUser = {
//   email: 'login-seeded@example.com',
//   password: validInput.password,
// };

// test.describe('Login page test suite', () => {
//   let loginPage: LoginPage;

//   test.beforeAll(async ({ browser }) => {
//     const page = await browser.newPage();
//     const registerPage = new RegisterPage(page);

//     await registerPage.gotoreg();
//     await registerPage.register(seededUser.email, seededUser.password);

//     await page.close();
//   });

//   test.beforeEach(async ({ page }) => {
//     loginPage = new LoginPage(page);
//     await loginPage.goto();
//   });

//   test('Login with valid email and valid password', async ({ page }) => {
//     await loginPage.login(seededUser.email, seededUser.password);
//     await loginPage.expectSuccess('Login success, opening garage...');
//     await expect(page.getByTestId('screen-garage')).toBeVisible();
//   });

//   test('Login with non existing email and non existing password', async ({
//     page,
//   }) => {
//     await loginPage.login('nonexistingemail@test.com', 'testingpass');
//     await loginPage.expectError('Invalid credentials');
//     await expect(page.getByTestId('screen-login')).toBeVisible();
//   });

//   test('Login with missing email', async ({ page }) => {
//     await loginPage.login('', 'testingpass');
//     await loginPage.expectError('Email is required');
//     await expect(page.getByTestId('screen-login')).toBeVisible();
//   });

//   test('Login with missing password', async ({ page }) => {
//     await loginPage.login('nonexistingemail@test.com', '');
//     await loginPage.expectError('Password is required');
//     await expect(page.getByTestId('screen-login')).toBeVisible();
//   });

//   for (const key of Object.keys(invalidEmailInput)) {
//     const { value, testDescription } = invalidEmailInput[key];

//     test(`Invalid email: ${testDescription}`, async ({ page }) => {
//       await loginPage.login(value, seededUser.password);

//       if (value === '    ' || value === '') {
//         await loginPage.expectError('Email is required');
//       } else {
//         await loginPage.expectError('Invalid email format');
//       }

//       await expect(page.getByTestId('screen-login')).toBeVisible();
//     });
//   }

//   for (const key of Object.keys(invalidPasswordInput)) {
//     const { value, testDescription } = invalidPasswordInput[key];

//     test(`Invalid password: ${testDescription}`, async ({ page }) => {
//       await loginPage.login(seededUser.email, value);

//       if (value === '    ' || value === '') {
//         await loginPage.expectError('Password is required');
//       } else {
//         await loginPage.expectError('Invalid credentials');
//       }

//       await expect(page.getByTestId('screen-login')).toBeVisible();
//     });
//   }
// });
