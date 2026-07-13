export class ServiceResult {
  constructor({
    success = false,
    data = null,
    error = null,
    code = 'UNKNOWN_ERROR',
    message = 'Operation failed',
    decision = null,
    metadata = {}
  } = {}) {
    this.success = success;
    this.data = data;
    this.error = error;
    this.code = code;
    this.message = message;
    this.decision = decision;
    this.metadata = metadata;
  }

  static success(data = null, metadata = {}, decision = null, message = 'Operation completed successfully', code = 'SUCCESS') {
    return new ServiceResult({ success: true, data, code, message, decision, metadata });
  }

  static failure(error, metadata = {}, decision = null, message = 'Operation failed', code = 'UNKNOWN_ERROR') {
    return new ServiceResult({
      success: false,
      data: null,
      error,
      code,
      message,
      decision,
      metadata
    });
  }

  static fromError(error, metadata = {}, decision = null) {
    const normalizedError = typeof error === 'string' ? error : error?.message ?? 'Unknown error';
    return ServiceResult.failure(normalizedError, metadata, decision, 'Operation failed', 'UNKNOWN_ERROR');
  }

  static validationFailed(message = 'Validation failed', metadata = {}, decision = null) {
    return ServiceResult.failure(message, metadata, decision, message, 'VALIDATION_FAILED');
  }

  static accessDenied(message = 'Access denied', metadata = {}, decision = null) {
    return ServiceResult.failure(message, metadata, decision, message, 'ACCESS_DENIED');
  }

  static notFound(message = 'Resource not found', metadata = {}, decision = null) {
    return ServiceResult.failure(message, metadata, decision, message, 'NOT_FOUND');
  }

  toJSON() {
    return {
      success: this.success,
      data: this.data,
      error: this.error,
      code: this.code,
      message: this.message,
      decision: this.decision,
      metadata: this.metadata
    };
  }
}
