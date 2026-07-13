import { AttendanceService } from '../../services/index.js';
import { ServiceResult } from '../../services/serviceResult.js';

export class AttendanceController {
  constructor(dependencies = {}) {
    this.attendanceService = dependencies.attendanceService || new AttendanceService(dependencies);
  }

  async list(req, res, next) {
    try {
      const result = await (typeof this.attendanceService.list === 'function'
        ? this.attendanceService.list(req.query)
        : typeof this.attendanceService.getAttendance === 'function'
          ? this.attendanceService.getAttendance(req.query)
          : ServiceResult.failure('Attendance listing not implemented', {}, null, 'Attendance listing not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await (typeof this.attendanceService.getById === 'function'
        ? this.attendanceService.getById(req.params.id)
        : typeof this.attendanceService.getAttendance === 'function'
          ? this.attendanceService.getAttendance({ id: req.params.id })
          : ServiceResult.notFound('Attendance record not found', {}));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await (typeof this.attendanceService.create === 'function'
        ? this.attendanceService.create(req.body)
        : ServiceResult.failure('Attendance creation not implemented', {}, null, 'Attendance creation not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 201 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const result = await (typeof this.attendanceService.update === 'function'
        ? this.attendanceService.update(req.params.id, req.body)
        : ServiceResult.failure('Attendance update not implemented', {}, null, 'Attendance update not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }
}
