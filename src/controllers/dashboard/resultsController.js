import { ResultsService } from '../../services/index.js';
import { ServiceResult } from '../../services/serviceResult.js';

export class ResultsController {
  constructor(dependencies = {}) {
    this.resultsService = dependencies.resultsService || new ResultsService(dependencies);
  }

  async list(req, res, next) {
    try {
      const result = await (typeof this.resultsService.list === 'function'
        ? this.resultsService.list(req.query)
        : typeof this.resultsService.getResults === 'function'
          ? this.resultsService.getResults(req.query)
          : ServiceResult.failure('Results listing not implemented', {}, null, 'Results listing not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await (typeof this.resultsService.getById === 'function'
        ? this.resultsService.getById(req.params.id)
        : typeof this.resultsService.getResults === 'function'
          ? this.resultsService.getResults({ id: req.params.id })
          : ServiceResult.notFound('Results record not found', {}));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await (typeof this.resultsService.create === 'function'
        ? this.resultsService.create(req.body)
        : ServiceResult.failure('Results creation not implemented', {}, null, 'Results creation not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 201 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const result = await (typeof this.resultsService.update === 'function'
        ? this.resultsService.update(req.params.id, req.body)
        : ServiceResult.failure('Results update not implemented', {}, null, 'Results update not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }
}
