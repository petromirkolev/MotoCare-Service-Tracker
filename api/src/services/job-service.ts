import { v4 as uuidv4 } from 'uuid';
import { getAll, getOne, runQuery } from '../db-helpers';
import { JobRow } from '../types/job';

export async function createJob(params: {
  user_id: string;
  bike_id: string;
  service_type: string;
  odometer: number;
  note: string;
}): Promise<string> {
  const now = new Date().toISOString();
  const id = uuidv4();

  await runQuery(
    `
      INSERT INTO jobs (id, user_id, bike_id, service_type, odometer, note, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
    [
      id,
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
  return id;
}

export async function findJobById(id: string): Promise<JobRow | undefined> {
  return getOne<JobRow>('SELECT * FROM jobs WHERE id = $1', [id]);
}

export async function listJobsByUserId(user_id: string): Promise<JobRow[]> {
  return getAll<JobRow>(
    'SELECT * FROM jobs WHERE user_id = $1 ORDER BY created_at DESC',
    [user_id],
  );
}

export async function updateJobStatus(params: {
  id: string;
  user_id: string;
  status: string;
}): Promise<void> {
  await runQuery(
    `
      UPDATE jobs
      SET status = $1, updated_at = $2
      WHERE id = $3 AND user_id = $4
    `,
    [params.status, new Date().toISOString(), params.id, params.user_id],
  );
}

export async function deleteJob(params: {
  id: string;
  user_id: string;
}): Promise<void> {
  await runQuery(
    `
      DELETE FROM jobs
      WHERE id = $1 AND user_id = $2
    `,
    [params.id, params.user_id],
  );
}
