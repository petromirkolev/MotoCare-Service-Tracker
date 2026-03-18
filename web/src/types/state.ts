/* This file defines the structure of the application's state, including the types for bikes, maintenance items, and maintenance logs. It also initializes the appState with default values.
 */

import type { Bike } from './bikes';
import type { Job } from './job';

export type StoreState = {
  bikes: Bike[];
  jobs: Job[];
};

type AppState = {
  selectedBikeId: string | null;
};

export const appState: AppState = {
  selectedBikeId: null,
};
