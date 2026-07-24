export const createConnectorRegistry = () => {
  const connectors = new Map();

  return {
    registerConnector(connector) {
      connectors.set(connector.name, {
        ...connector,
        supportedDatabases: connector.supportedDatabases || [],
        compatibility: connector.compatibility || 'unknown'
      });
      return connectors.get(connector.name);
    },

    getConnector(name) {
      return connectors.get(name) || null;
    },

    listConnectors() {
      return Array.from(connectors.values());
    }
  };
};

export default createConnectorRegistry;
