import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { getOne, runQuery } from '../db-helpers';

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
};

export async function findUserByEmail(
  email: string,
): Promise<UserRow | undefined> {
  return getOne<UserRow>('SELECT * FROM users WHERE email = $1', [email]);
}

export async function createUser(
  email: string,
  password: string,
): Promise<void> {
  const password_hash = await bcrypt.hash(password, 10);

  await runQuery(
    `
      INSERT INTO users (id, email, password_hash, created_at)
      VALUES ($1, $2, $3, $4)
    `,
    [uuidv4(), email, password_hash, new Date().toISOString()],
  );
}

export async function verifyUserPassword(
  password: string,
  password_hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, password_hash);
}
