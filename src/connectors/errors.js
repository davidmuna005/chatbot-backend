export class ConnectorError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
  }
}

export class ConnectorConfigurationError extends ConnectorError {}
export class ConnectorConnectionError extends ConnectorError {}
export class ConnectorTimeoutError extends ConnectorError {}
export class ConnectorUnsupportedFeatureError extends ConnectorError {}
export class ConnectorUnavailableError extends ConnectorError {}
