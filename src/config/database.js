import { environment } from './environment.js';

export const database = {
  client: environment.DB_CLIENT,
  sqlite: {
    filename: environment.DATABASE_PATH
  }
};
