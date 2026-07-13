import test from 'node:test';
import assert from 'node:assert/strict';

import { initializeConnectorRegistry, ConnectorFactory, connectorRegistry } from '../src/connectors/index.js';
import { ConnectorConfigurationError } from '../src/connectors/errors.js';

const createConfig = (engine = 'sqlserver') => ({
  database: {
    engine,
    host: 'localhost',
    port: 1433,
    username: 'sa',
    password: 'secret',
    database: 'schooldb',
    timeoutMs: 2000,
    pool: {
      max: 5,
      min: 0,
      idleTimeoutMs: 30000
    }
  },
  logger: {
    info() {},
    warn() {},
    error() {},
    debug() {}
  }
});

test('connector registry initializes built-in connectors and returns the active connector', async () => {
  const registry = initializeConnectorRegistry();
  const connector = registry.getConnector('sqlserver', createConfig('sqlserver'));

  assert.equal(connector.constructor.name, 'SqlServerConnector');
  assert.equal(await connector.health(), 'Unknown');

  await connector.initialize();
  const connection = await connector.connect();
  assert.equal(connection.connected, true);
  assert.equal(await connector.health(), 'Connected');
});

test('connector factory creates connectors from config and supports future connector registration', async () => {
  const factory = new ConnectorFactory(connectorRegistry);
  const connector = factory.createFromConfig(createConfig('mysql'));

  assert.equal(connector.constructor.name, 'MySQLConnector');

  class FutureConnector extends (await import('../src/connectors/baseConnector.js')).BaseConnector {}
  connectorRegistry.register('rest', FutureConnector);

  const futureConnector = factory.createFromConfig(createConfig('rest'));
  assert.equal(futureConnector.constructor.name, 'FutureConnector');
});

test('unsupported connector types raise a standardized configuration error', () => {
  const factory = new ConnectorFactory(connectorRegistry);

  assert.throws(() => factory.createFromConfig(createConfig('unknown')), (error) => {
    assert.ok(error instanceof ConnectorConfigurationError);
    return true;
  });
});
