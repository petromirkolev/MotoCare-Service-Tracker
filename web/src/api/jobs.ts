/* This file contains functions for managing jobs, including fetching, creating, updating, and deleting jobs. */

import { getCurrentUser } from '../state/auth-store';
import { API_BASE_URL } from './base';
import type { CreateJobResponse, ErrorResponse } from '../types/job';

export async function createJobApi(input: {
  bike_id: string;
  service_type: string;
  odometer: number;
  note: string;
}): Promise<CreateJobResponse> {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('No logged-in user');

  const response = await fetch(
    `${API_BASE_URL}/jobs?user_id=${encodeURIComponent(currentUser.id)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bike_id: input.bike_id,
        service_type: input.service_type,
        odometer: input.odometer,
        note: input.note,
      }),
    },
  );

  const data = (await response.json()) as CreateJobResponse | ErrorResponse;

  if (!response.ok) {
    throw new Error('error' in data ? data.error : 'Failed to create job');
  }

  return data as CreateJobResponse;
}

export async function getJobsApi(userId: string) {
  const response = await fetch(`${API_BASE_URL}/jobs?user_id=${userId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch jobs');
  }

  return data.jobs;
}
