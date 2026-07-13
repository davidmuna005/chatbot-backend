import { ServiceResult } from '../serviceResult.js';

export class NotificationService {
  constructor({ notificationRepository, logger } = {}) {
    this.notificationRepository = notificationRepository;
    this.logger = logger;
  }

  async send({ parentId, channel = 'whatsapp', message }) {
    try {
      this.logger?.info?.('Service started', { service: 'NotificationService', action: 'send' });
      const notification = await this.notificationRepository?.create?.({ parentId, channel, body: message });
      this.logger?.info?.('Service completed', { service: 'NotificationService', action: 'send' });
      return ServiceResult.success(notification, {}, null, 'Notification processed successfully', 'NOTIFICATION_SENT');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'NotificationService', action: 'send', error: error.message });
      return ServiceResult.fromError(error);
    }
  }
}
