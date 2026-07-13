import { FeeBalanceService } from '../../services/index.js';
import { ServiceResult } from '../../services/serviceResult.js';

export class FeeController {
  constructor(dependencies = {}) {
    this.feeService = dependencies.feeService || new FeeBalanceService(dependencies);
  }

  async list(req, res, next) {
    try {
      const result = await (typeof this.feeService.list === 'function'
        ? this.feeService.list(req.query)
        : ServiceResult.failure('Fee listing not implemented', {}, null, 'Fee listing not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await (typeof this.feeService.getById === 'function'
        ? this.feeService.getById(req.params.id)
        : ServiceResult.notFound('Fee record not found', {}));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await (typeof this.feeService.create === 'function'
        ? this.feeService.create(req.body)
        : ServiceResult.failure('Fee creation not implemented', {}, null, 'Fee creation not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 201 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const result = await (typeof this.feeService.update === 'function'
        ? this.feeService.update(req.params.id, req.body)
        : ServiceResult.failure('Fee update not implemented', {}, null, 'Fee update not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }
}
