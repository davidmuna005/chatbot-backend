import { StudentService } from '../../services/index.js';
import { ServiceResult } from '../../services/serviceResult.js';

export class StudentController {
  constructor(dependencies = {}) {
    this.studentService = dependencies.studentService || new StudentService(dependencies);
  }

  async list(req, res, next) {
    try {
      const result = await (typeof this.studentService.list === 'function'
        ? this.studentService.list(req.query)
        : typeof this.studentService.getStudent === 'function'
          ? this.studentService.getStudent(req.query)
          : ServiceResult.failure('Student listing not implemented', {}, null, 'Student listing not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await (typeof this.studentService.getById === 'function'
        ? this.studentService.getById(req.params.id)
        : typeof this.studentService.getStudent === 'function'
          ? this.studentService.getStudent({ studentId: req.params.id })
          : ServiceResult.notFound('Student not found', {}));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await (typeof this.studentService.create === 'function'
        ? this.studentService.create(req.body)
        : ServiceResult.failure('Student creation not implemented', {}, null, 'Student creation not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 201 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const result = await (typeof this.studentService.update === 'function'
        ? this.studentService.update(req.params.id, req.body)
        : ServiceResult.failure('Student update not implemented', {}, null, 'Student update not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async remove(req, res, next) {
    try {
      const result = await (typeof this.studentService.remove === 'function'
        ? this.studentService.remove(req.params.id)
        : ServiceResult.failure('Student removal not implemented', {}, null, 'Student removal not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }
}
