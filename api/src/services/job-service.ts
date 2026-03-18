import { v4 as uuidv4 } from 'uuid';
import { getAll, getOne, runQuery } from '../db-helpers';
import { JobRow } from '../types/job';

export async function createJob(params: {
  user_id: string;
  bike_id: string;
  service_type: string;
  odometer: number;
  note: string;
}): Promise<void> {
  const now = new Date().toISOString();

  await runQuery(
    `
      INSERT INTO jobs (id, user_id, bike_id, service_type, odometer, note, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      uuidv4(),
      params.user_id,
      params.bike_id,
      params.service_type,
      params.odometer,
      params.note,
      'requested',
      now,
      now,
    ],
  );
}

export async function findJobById(id: string): Promise<JobRow | undefined> {
  return getOne<JobRow>('SELECT * FROM jobs WHERE id = ?', [id]);
}

export async function listJobsByUserId(user_id: string): Promise<JobRow[]> {
  return getAll<JobRow>(
    'SELECT * FROM jobs WHERE user_id = ? ORDER BY created_at DESC',
    [user_id],
  );
}

export async function deleteJob(params: {
  id: string;
  user_id: string;
}): Promise<void> {
  await runQuery(
    `
      DELETE FROM jobs
      WHERE id = ? AND user_id = ?
    `,
    [params.id, params.user_id],
  );
}
