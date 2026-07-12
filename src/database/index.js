import sqlite3 from 'sqlite3';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

let database = null;

const ensureDatabaseDirectory = async (filename) => {
  const absolutePath = resolve(process.cwd(), filename);
  const directory = dirname(absolutePath);
  await fs.mkdir(directory, { recursive: true });
  return absolutePath;
};

export const connectDatabase = async ({ client, sqlite }) => {
  if (client !== 'sqlite') {
    throw new Error(`Unsupported application database client: ${client}`);
  }

  const filename = await ensureDatabaseDirectory(sqlite.filename);
  const sqlite3Verbose = sqlite3.verbose();

  database = await new Promise((resolve, reject) => {
    const db = new sqlite3Verbose.Database(filename, sqlite3Verbose.OPEN_READWRITE | sqlite3Verbose.OPEN_CREATE, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(db);
    });
  });

  await new Promise((resolve, reject) => {
    database.get('SELECT 1 AS ok', (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

  return database;
};

export const checkDatabaseHealth = async () => {
  if (!database) {
    return { status: 'unavailable' };
  }

  return new Promise((resolve) => {
    database.get('SELECT 1 AS ok', (error) => {
      if (error) {
        resolve({ status: 'unhealthy', error: error.message });
        return;
      }
      resolve({ status: 'ok' });
    });
  });
};

export const closeDatabase = async () => {
  if (!database) {
    return;
  }

  await new Promise((resolve, reject) => {
    database.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};
