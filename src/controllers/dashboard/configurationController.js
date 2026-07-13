import { ConfigurationService } from '../../services/index.js';
import { ServiceResult } from '../../services/serviceResult.js';

export class ConfigurationController {
  constructor(dependencies = {}) {
    this.configurationService = dependencies.configurationService || new ConfigurationService(dependencies);
  }

  async list(req, res, next) {
    try {
      const result = await (typeof this.configurationService.list === 'function'
        ? this.configurationService.list(req.query)
        : typeof this.configurationService.get === 'function'
          ? this.configurationService.get(req.query?.key)
          : ServiceResult.failure('Configuration listing not implemented', {}, null, 'Configuration listing not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await (typeof this.configurationService.getById === 'function'
        ? this.configurationService.getById(req.params.id)
        : typeof this.configurationService.get === 'function'
          ? this.configurationService.get(req.params.id)
          : ServiceResult.notFound('Configuration entry not found', {}));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await (typeof this.configurationService.create === 'function'
        ? this.configurationService.create(req.body)
        : typeof this.configurationService.update === 'function'
          ? this.configurationService.update(req.body)
          : ServiceResult.failure('Configuration creation not implemented', {}, null, 'Configuration creation not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 201 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const result = await (typeof this.configurationService.update === 'function'
        ? this.configurationService.update({ id: req.params.id, ...req.body })
        : ServiceResult.failure('Configuration update not implemented', {}, null, 'Configuration update not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }
}
