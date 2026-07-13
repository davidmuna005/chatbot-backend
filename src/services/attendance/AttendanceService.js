import { ServiceResult } from '../serviceResult.js';

export class AttendanceService {
  constructor({ attendanceRepository, authorizationPolicy, logger } = {}) {
    this.attendanceRepository = attendanceRepository;
    this.authorizationPolicy = authorizationPolicy;
    this.logger = logger;
  }

  async getAttendance(payload = {}) {
    try {
      this.logger?.info?.('Service started', { service: 'AttendanceService', action: 'getAttendance' });
      const attendance = await this.attendanceRepository?.getAttendance?.(payload);
      const decision = this.authorizationPolicy?.evaluate?.({ user: { permissions: ['view-attendance'] }, permission: 'view-attendance' });
      if (!decision?.allowed) {
        return ServiceResult.accessDenied(decision?.reason ?? 'attendance-access-denied', {}, decision);
      }
      this.logger?.info?.('Service completed', { service: 'AttendanceService', action: 'getAttendance' });
      return ServiceResult.success(attendance, {}, decision, 'Attendance retrieved successfully', 'ATTENDANCE_FOUND');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'AttendanceService', action: 'getAttendance', error: error.message });
      return ServiceResult.fromError(error);
    }
  }
}
