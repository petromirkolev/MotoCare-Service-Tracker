/* Bike store manages the list of bikes and their basic information. */

import type { Bike } from '../types/bikes';
import { getState, setState } from './state-store';

export function readBikeForm(form: HTMLFormElement) {
  const fd = new FormData(form);

  const make: string = String(fd.get('make') ?? '').trim();
  const model: string = String(fd.get('model') ?? '').trim();

  const yearRaw: string = String(fd.get('year') ?? '').trim();
  const year: number = Number(yearRaw);

  if (!make) throw new Error('Make is required');
  if (!model) throw new Error('Model is required');
  if (!Number.isFinite(year)) throw new Error('Year must be a number');

  return { make, year, model };
}

export const bikeStore = {
  getBikes(): Bike[] {
    return [...getState().bikes];
  },

  getBike(id: string): Bike | undefined {
    return getState().bikes.find((b) => b.id === id);
  },

  reset() {
    setState({ bikes: [] });
  },
};
