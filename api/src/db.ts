import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

const DB_PATH = process.env.DB_PATH || './data/motocarejobs.sqlite';
const DB_DIR = path.dirname(DB_PATH);

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite:', err.message);
    return;
  }

  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
      )
    `,
    (tableErr) => {
      if (tableErr) {
        console.error('Failed to create users table:', tableErr.message);
        return;
      }
    },
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS bikes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id))
      `,
    (tableErr) => {
      if (tableErr) {
        console.error('Failed to create bikes table:', tableErr.message);
        return;
      }
    },
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    bike_id TEXT NOT NULL,
    service_type TEXT NOT NULL,
    odometer INTEGER NOT NULL,
    note TEXT,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (bike_id) REFERENCES bikes(id)
  )`,
    (tableErr) => {
      if (tableErr) {
        console.error('Failed to create jobs table:', tableErr.message);
        return;
      }
    },
  );
});
