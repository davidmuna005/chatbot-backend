import { DisciplineService } from '../../services/index.js';
import { ServiceResult } from '../../services/serviceResult.js';

export class DisciplineController {
  constructor(dependencies = {}) {
    this.disciplineService = dependencies.disciplineService || new DisciplineService(dependencies);
  }

  async list(req, res, next) {
    try {
      const result = await (typeof this.disciplineService.list === 'function'
        ? this.disciplineService.list(req.query)
        : typeof this.disciplineService.getDiscipline === 'function'
          ? this.disciplineService.getDiscipline(req.query)
          : ServiceResult.failure('Discipline listing not implemented', {}, null, 'Discipline listing not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await (typeof this.disciplineService.getById === 'function'
        ? this.disciplineService.getById(req.params.id)
        : typeof this.disciplineService.getDiscipline === 'function'
          ? this.disciplineService.getDiscipline({ id: req.params.id })
          : ServiceResult.notFound('Discipline record not found', {}));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await (typeof this.disciplineService.create === 'function'
        ? this.disciplineService.create(req.body)
        : ServiceResult.failure('Discipline creation not implemented', {}, null, 'Discipline creation not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 201 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const result = await (typeof this.disciplineService.update === 'function'
        ? this.disciplineService.update(req.params.id, req.body)
        : ServiceResult.failure('Discipline update not implemented', {}, null, 'Discipline update not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }
}
