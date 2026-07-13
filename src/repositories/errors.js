export class RepositoryError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
  }
}

export class RepositoryNotFoundError extends RepositoryError {}
export class RepositoryValidationError extends RepositoryError {}
export class RepositoryUnavailableError extends RepositoryError {}
