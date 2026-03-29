import { test, expect, uniqueEmail, validInput } from '../fixtures/bikes';

test.describe('Bikes', () => {
  test('User can add bike successfully', async ({
    loggedInUser,
    seededBike,
    bikesPage,
  }) => {
    await bikesPage.addBike(seededBike);
    await bikesPage.expectBikeVisible(seededBike.make);
  });

  test('Bike persists after page refresh', async ({
    loggedInUser,
    seededBike,
    bikesPage,
  }) => {
    await bikesPage.addBike(seededBike);
    await bikesPage.expectBikeVisible(seededBike.make);

    await bikesPage.page.reload();

    await bikesPage.expectBikeVisible(seededBike.make);
  });

  test('Bike count updates after adding a bike', async ({
    loggedInUser,
    seededBike,
    bikesPage,
  }) => {
    await bikesPage.addBike(seededBike);
    await bikesPage.expectBikeVisible(seededBike.make);

    await expect(bikesPage.bikeCount).toHaveText('1 motorcycle');
  });

  test('Add bike with empty make is rejected', async ({
    loggedInUser,
    bikesPage,
  }) => {
    await bikesPage.addBike({
      make: '',
      model: 'Tracer 9GT',
      year: '2021',
    });

    await bikesPage.expectError('Make is required');
  });

  test('Add bike with empty model is rejected', async ({
    loggedInUser,
    bikesPage,
  }) => {
    await bikesPage.addBike({
      make: 'Yamaha',
      model: '',
      year: '2021',
    });

    await bikesPage.expectError('Model is required');
  });

  test('Add bike with empty year is rejected', async ({
    loggedInUser,
    bikesPage,
  }) => {
    await bikesPage.addBike({
      make: 'Yamaha',
      model: 'Tracer 9GT',
      year: '',
    });

    await bikesPage.expectError('Invalid year');
  });

  test('Add bike with year below allowed range is rejected', async ({
    loggedInUser,
    bikesPage,
  }) => {
    await bikesPage.addBike({
      make: 'Yamaha',
      model: 'Tracer 9GT',
      year: '1899',
    });

    await bikesPage.expectError('Invalid year');
  });

  test('Add bike with year above allowed range is rejected', async ({
    loggedInUser,
    bikesPage,
  }) => {
    await bikesPage.addBike({
      make: 'Yamaha',
      model: 'Tracer 9GT',
      year: '2101',
    });

    await bikesPage.expectError('Invalid year');
  });

  test('User can delete bike successfully', async ({
    garageWithOneBike,
    bikesPage,
  }) => {
    await bikesPage.deleteBikeByName(garageWithOneBike.make);
    await bikesPage.expectBikeNotVisible(garageWithOneBike.make);
  });

  test('Bike delete persists after refresh', async ({
    garageWithOneBike,
    bikesPage,
  }) => {
    await bikesPage.deleteBikeByName(garageWithOneBike.make);
    await bikesPage.expectBikeNotVisible(garageWithOneBike.make);

    await bikesPage.page.reload();

    await bikesPage.expectBikeNotVisible(garageWithOneBike.make);
  });

  test('Empty state is shown when user has no added bikes', async ({
    loggedInUser,
    bikesPage,
  }) => {
    await expect(bikesPage.emptyBikeScreen).toBeVisible();
    await expect(bikesPage.bikesList).toBeHidden();
  });

  test('Empty state is not shown after adding first bike', async ({
    loggedInUser,
    seededBike,
    bikesPage,
  }) => {
    await bikesPage.addBike(seededBike);

    await bikesPage.expectBikeVisible(seededBike.make);

    await expect(bikesPage.bikesList).toBeVisible();
    await expect(bikesPage.emptyBikeScreen).toBeHidden();
  });

  test('User sees his own bikes only', async ({
    garageWithOneBike,
    seededBike,
    bikesPage,
    registerPage,
    loginPage,
  }) => {
    await bikesPage.logoutButton.click();

    await registerPage.gotoreg();

    const email = uniqueEmail();
    const password = validInput.password;

    await registerPage.register(email, password, password);
    await registerPage.expectSuccess('Registration successful!');

    await loginPage.goto();
    await loginPage.login(email, password);

    await bikesPage.expectBikeNotVisible(seededBike.make);
  });

  test('Bike shows "Ready" when it has no open jobs', async ({
    garageWithOneBike,
    bikesPage,
  }) => {
    await expect(bikesPage.bikeTag).toHaveText('Ready');
  });

  test('Bike shows "Not ready" when it has open jobs', async ({
    garageWithOneBike,
    bikesPage,
    jobsPage,
  }) => {
    await expect(bikesPage.bikeTag).toHaveText('Ready');

    await jobsPage.gotoJobsPage();

    await jobsPage.addJob(
      'Oil Change',
      `${garageWithOneBike.make} ${garageWithOneBike.model}`,
      '20000',
    );

    await bikesPage.gotoBikesPage();

    await expect(bikesPage.bikeTag).toHaveText('Not ready');
  });

  test('Bike shows "Ready" when open job is done', async ({
    garageWithOneBike,
    bikesPage,
    jobsPage,
  }) => {
    await expect(bikesPage.bikeTag).toHaveText('Ready');

    await jobsPage.gotoJobsPage();

    await jobsPage.addJob(
      'Oil Change',
      `${garageWithOneBike.make} ${garageWithOneBike.model}`,
      '20000',
    );

    await bikesPage.gotoBikesPage();

    await expect(bikesPage.bikeTag).toHaveText('Not ready');

    await jobsPage.gotoJobsPage();

    await bikesPage.pageJobs.getByTestId('btn-job-approve').click();
    await bikesPage.pageJobs.getByTestId('btn-job-start').click();
    await bikesPage.pageJobs.getByTestId('btn-job-complete').click();

    await bikesPage.gotoBikesPage();

    await expect(bikesPage.bikeTag).toHaveText('Ready');
  });

  test('Bike shows "Ready" when open job is cancelled', async ({
    garageWithOneBike,
    bikesPage,
    jobsPage,
  }) => {
    await expect(bikesPage.bikeTag).toHaveText('Ready');

    await jobsPage.gotoJobsPage();

    await jobsPage.addJob(
      'Oil Change',
      `${garageWithOneBike.make} ${garageWithOneBike.model}`,
      '20000',
    );

    await bikesPage.gotoBikesPage();

    await expect(bikesPage.bikeTag).toHaveText('Not ready');

    await jobsPage.gotoJobsPage();

    await bikesPage.pageJobs.getByTestId('btn-job-cancel').click();

    await bikesPage.gotoBikesPage();

    await expect(bikesPage.bikeTag).toHaveText('Ready');
  });
});
