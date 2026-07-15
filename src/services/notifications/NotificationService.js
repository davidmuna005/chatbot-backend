import { ServiceResult } from '../serviceResult.js';

export class NotificationService {
  constructor({ notificationRepository, logger } = {}) {
    this.notificationRepository = notificationRepository;
    this.logger = logger;
  }

  async send({ parentId, channel = 'whatsapp', message } = {}) {
    try {
      this.logger?.info?.('Service started', { service: 'NotificationService', action: 'send' });
      if (!parentId || !message) {
        return ServiceResult.validationFailed('Parent ID and message are required to send a notification');
      }

      const notification = await this.notificationRepository?.create?.({ parentId, channel, body: message, createdAt: new Date().toISOString() });
      this.logger?.info?.('Service completed', { service: 'NotificationService', action: 'send' });
      return ServiceResult.success(notification, {}, null, 'Notification processed successfully', 'NOTIFICATION_SENT');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'NotificationService', action: 'send', error: error.message });
      return ServiceResult.fromError(error);
    }
  }

  async list({ parentId, channel, limit = 50, offset = 0 } = {}) {
    try {
      const notifications = await this.notificationRepository?.search?.({ parentId, channel, limit, offset });
      return ServiceResult.success(Array.isArray(notifications) ? notifications : [], {}, null, 'Notifications retrieved successfully', 'NOTIFICATIONS_LISTED');
    } catch (error) {
      return ServiceResult.fromError(error);
    }
  }

  async getById(id) {
    try {
      const notification = await this.notificationRepository?.find?.({ id });
      if (!notification) {
        return ServiceResult.notFound('Notification not found', {}, null, 'Notification not found', 'NOTIFICATION_NOT_FOUND');
      }
      return ServiceResult.success(notification, {}, null, 'Notification retrieved successfully', 'NOTIFICATION_FOUND');
    } catch (error) {
      return ServiceResult.fromError(error);
    }
  }

  async create(payload = {}) {
    return this.send(payload);
  }
}
