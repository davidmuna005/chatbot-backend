/**
 * Database Adapters Index
 * 
 * Exports all database adapters
 */

export { DatabaseAdapter } from './base.js';
export { MySQLAdapter } from './mysql.js';
export { PostgresAdapter } from './postgres.js';
export { SqlServerAdapter } from './sqlserver.js';

export const adapterRegistry = {
  mysql: () => import('./mysql.js').then(m => m.MySQLAdapter),
  postgres: () => import('./postgres.js').then(m => m.PostgresAdapter),
  postgresql: () => import('./postgres.js').then(m => m.PostgresAdapter),
  sqlserver: () => import('./sqlserver.js').then(m => m.SqlServerAdapter),
  mssql: () => import('./sqlserver.js').then(m => m.SqlServerAdapter)
};

export async function getAdapter(type) {
  const factory = adapterRegistry[type?.toLowerCase?.()];
  if (!factory) {
    throw new Error(`Unsupported database adapter: ${type}`);
  }
  return factory();
}
