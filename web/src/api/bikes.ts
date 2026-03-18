/* This file contains functions for managing bikes, including fetching, creating, updating, and deleting bikes. */

import { API_BASE_URL } from './base';
import { getCurrentUser } from '../state/auth-store';
import { bikeStore } from '../state/bike-store';
import type {
  Bike,
  ListBikesResponse,
  ErrorResponse,
  CreateBikeResponse,
} from '../types/bikes';

export async function getBikesApi(): Promise<Bike[]> {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    throw new Error('No logged-in user');
  }

  const response = await fetch(
    `${API_BASE_URL}/bikes?user_id=${encodeURIComponent(currentUser.id)}`,
  );

  const data = (await response.json()) as ListBikesResponse | ErrorResponse;

  if (!response.ok) {
    throw new Error('error' in data ? data.error : 'Failed to fetch bikes');
  }

  return (data as ListBikesResponse).bikes;
}

export async function createBikeApi(input: {
  make: string;
  model: string;
  year: number;
}): Promise<CreateBikeResponse> {
  const currentUser = getCurrentUser();

  if (!currentUser) throw new Error('No logged-in user');

  if (input.year !== undefined && (input.year < 1900 || input.year > 2100))
    throw new Error('Invalid year');

  const response = await fetch(`${API_BASE_URL}/bikes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: currentUser.id,
      make: input.make,
      model: input.model,
      year: input.year,
    }),
  });

  const data = (await response.json()) as CreateBikeResponse | ErrorResponse;

  if (!response.ok) {
    throw new Error('error' in data ? data.error : 'Failed to create bike');
  }

  return data as CreateBikeResponse;
}

export async function updateBikeApi(input: {
  id: string;
  make: string;
  model: string;
  year: number;
}): Promise<{ message: string }> {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('No logged-in user');
  }

  const currentBike = bikeStore.getBike(input.id);
  if (!currentBike) throw new Error('Bike not found');

  if (input.year !== undefined && (input.year < 1900 || input.year > 2100)) {
    throw new Error('Invalid year');
  }

  const response = await fetch(
    `${API_BASE_URL}/bikes/${encodeURIComponent(input.id)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: currentUser.id,
        make: input.make,
        model: input.model,
        year: input.year,
      }),
    },
  );

  const data = (await response.json()) as { message: string } | ErrorResponse;

  if (!response.ok) {
    throw new Error('error' in data ? data.error : 'Failed to update bike');
  }

  return data as { message: string };
}

export async function deleteBikeApi(id: string): Promise<{ message: string }> {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    throw new Error('No logged-in user');
  }

  const response = await fetch(
    `${API_BASE_URL}/bikes/${encodeURIComponent(id)}?userId=${encodeURIComponent(currentUser.id)}`,
    {
      method: 'DELETE',
    },
  );

  const data = (await response.json()) as { message: string } | ErrorResponse;

  if (!response.ok) {
    throw new Error('error' in data ? data.error : 'Failed to delete bike');
  }

  return data as { message: string };
}
