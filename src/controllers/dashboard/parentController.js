import { ParentService } from '../../services/index.js';
import { ServiceResult } from '../../services/serviceResult.js';

export class ParentController {
  constructor(dependencies = {}) {
    this.parentService = dependencies.parentService || new ParentService(dependencies);
  }

  async list(req, res, next) {
    try {
      const result = await (typeof this.parentService.list === 'function'
        ? this.parentService.list(req.query)
        : typeof this.parentService.getParent === 'function'
          ? this.parentService.getParent(req.query)
          : ServiceResult.failure('Parent listing not implemented', {}, null, 'Parent listing not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await (typeof this.parentService.getById === 'function'
        ? this.parentService.getById(req.params.id)
        : typeof this.parentService.getParent === 'function'
          ? this.parentService.getParent({ id: req.params.id })
          : ServiceResult.notFound('Parent not found', {}));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await (typeof this.parentService.create === 'function'
        ? this.parentService.create(req.body)
        : ServiceResult.failure('Parent creation not implemented', {}, null, 'Parent creation not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 201 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const result = await (typeof this.parentService.update === 'function'
        ? this.parentService.update(req.params.id, req.body)
        : ServiceResult.failure('Parent update not implemented', {}, null, 'Parent update not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async remove(req, res, next) {
    try {
      const result = await (typeof this.parentService.remove === 'function'
        ? this.parentService.remove(req.params.id)
        : ServiceResult.failure('Parent removal not implemented', {}, null, 'Parent removal not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }
}
