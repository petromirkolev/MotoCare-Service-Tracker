/* Job store manages the list of jobs */

import type { Job } from '../types/job';
import { getState } from './state-store';

export function readJobForm(form: HTMLFormElement) {
  const fd = new FormData(form);

  const bike_id: string = String(fd.get('bikeId') ?? '').trim();
  const service_type: string = String(fd.get('serviceType') ?? '').trim();
  const odometerRaw: string = String(fd.get('odometer') ?? '').trim();
  const note: string = String(fd.get('note') ?? '').trim();

  const odometer = Number(odometerRaw);

  if (!bike_id) throw new Error('Bike is required');
  if (!service_type) throw new Error('Service type is required');
  if (!odometerRaw) throw new Error('Odometer is required');
  if (!Number.isFinite(odometer) || odometer < 0) {
    throw new Error('Odometer must be a valid number');
  }

  return { bike_id, service_type, odometer, note };
}

export const jobStore = {
  getJobs(): Job[] {
    return [...getState().jobs];
  },

  getJob(id: string): Job | undefined {
    return getState().jobs.find((job) => job.id === id);
  },
};
