import { APIResponse, test as base, expect } from '@playwright/test';
import { uniqueEmail, validInput } from '../utils/test-data';
import {
  addBikeApi,
  addJobApi,
  loginUserApi,
  registerUserApi,
} from '../utils/api-helpers';
import { LoginResponse } from '../types/login';
import { BikeResponse } from '../types/bike';
import { JobResponse } from '../types/job';

type ApiFixtures = {
  registrationResult: {
    email: string;
    password: string;
    response: APIResponse;
  };

  loginResult: {
    body: LoginResponse;
  };

  validBikeData: {
    make: string;
    model: string;
    year: number;
  };

  validJobData: {
    service_type: 'Oil change' | 'Coolant change';
    odometer: string | number;
    note: 'Change the oil' | 'Change the coolant';
  };

  garageWithBike: {
    body: BikeResponse;
  };

  bikeWithOneJob: {
    job: JobResponse;
  };
};

export const test = base.extend<ApiFixtures>({
  registrationResult: async ({ request }, use) => {
    const email = uniqueEmail();
    const password = validInput.password;

    const response = await registerUserApi(request, email, password);

    await use({ email, password, response });
  },

  loginResult: async ({ request, registrationResult }, use) => {
    const response = await loginUserApi(
      request,
      registrationResult.email,
      registrationResult.password,
    );

    const body = (await response.json()) as LoginResponse;

    await use({ body });
  },

  garageWithBike: async ({ request, loginResult, validBikeData }, use) => {
    const user_id = loginResult.body.user.id;

    const bikeResponse = await addBikeApi(request, user_id, validBikeData);

    const body = (await bikeResponse.json()) as BikeResponse;

    await use({ body });
  },

  bikeWithOneJob: async (
    { request, loginResult, garageWithBike, validJobData },
    use,
  ) => {
    const jobResponse = await addJobApi(
      request,
      garageWithBike.body.bike.id,
      loginResult.body.user.id,
      validJobData,
    );

    const job = await jobResponse.json();

    await use({ job });
  },

  validBikeData: async ({}, use) => {
    const make = 'Yamaha';
    const model = 'Tracer 9GT';
    const year = 2021;

    await use({ make, model, year });
  },

  validJobData: async ({}, use) => {
    const service_type = 'Oil change';
    const odometer = 1000;
    const note = 'Change the oil';
    await use({ service_type, odometer, note });
  },
});

export {
  expect,
  uniqueEmail,
  registerUserApi,
  loginUserApi,
  addBikeApi,
  addJobApi,
};
