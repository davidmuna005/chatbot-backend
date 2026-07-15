export class DeliveryStatusHandler {
  constructor({ notificationRepository, logger } = {}) {
    this.notificationRepository = notificationRepository;
    this.logger = logger;
  }

  async handle(status = {}, metadata = {}) {
    const standardizedStatus = this._normalizeStatus(status);
    this.logger?.info?.('Processing WhatsApp delivery status', { status: standardizedStatus, metadata });

    if (this.notificationRepository && status.id) {
      try {
        if (typeof this.notificationRepository.update === 'function') {
          await this.notificationRepository.update({ id: status.id, status: standardizedStatus });
        }
      } catch (error) {
        this.logger?.warn?.('Failed to update notification status', { error: error.message, statusId: status.id });
      }
    }

    return standardizedStatus;
  }

  _normalizeStatus(status = {}) {
    const normalized = String(status.status || '').toLowerCase();
    switch (normalized) {
      case 'delivered':
        return 'DELIVERED';
      case 'read':
        return 'READ';
      case 'failed':
        return 'FAILED';
      case 'queued':
        return 'QUEUED';
      case 'expired':
        return 'EXPIRED';
      default:
        return 'UNKNOWN';
    }
  }
}
