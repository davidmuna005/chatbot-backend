import { NotificationService } from '../../services/index.js';
import { ServiceResult } from '../../services/serviceResult.js';

export class NotificationController {
  constructor(dependencies = {}) {
    this.notificationService = dependencies.notificationService || new NotificationService(dependencies);
  }

  async list(req, res, next) {
    try {
      const result = await (typeof this.notificationService.list === 'function'
        ? this.notificationService.list(req.query)
        : ServiceResult.failure('Notification listing not implemented', {}, null, 'Notification listing not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await (typeof this.notificationService.getById === 'function'
        ? this.notificationService.getById(req.params.id)
        : ServiceResult.notFound('Notification not found', {}));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await (typeof this.notificationService.create === 'function'
        ? this.notificationService.create(req.body)
        : typeof this.notificationService.send === 'function'
          ? this.notificationService.send(req.body)
          : ServiceResult.failure('Notification creation not implemented', {}, null, 'Notification creation not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 201 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const result = await (typeof this.notificationService.update === 'function'
        ? this.notificationService.update(req.params.id, req.body)
        : ServiceResult.failure('Notification update not implemented', {}, null, 'Notification update not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }
}
