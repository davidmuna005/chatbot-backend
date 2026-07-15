import { ServiceResult } from '../serviceResult.js';

export class AttendanceService {
  constructor({ attendanceRepository, studentRepository, authorizationPolicy, logger } = {}) {
    this.attendanceRepository = attendanceRepository;
    this.studentRepository = studentRepository;
    this.authorizationPolicy = authorizationPolicy;
    this.logger = logger;
  }

  async getAttendance({ context, admissionNumber, studentId } = {}) {
    try {
      this.logger?.info?.('Service started', { service: 'AttendanceService', action: 'getAttendance' });

      if (!context?.authenticated) {
        return ServiceResult.accessDenied('Parent must be authenticated', {}, null, 'Authentication required to access attendance records', 'UNAUTHORIZED_PARENT');
      }

      const authDecision = this.authorizationPolicy?.evaluate?.({ user: { permissions: ['view-attendance'] }, permission: 'view-attendance' });
      if (!authDecision?.allowed) {
        return ServiceResult.accessDenied(authDecision?.reason ?? 'attendance-access-denied', {}, authDecision);
      }

      const student = context?.selectedStudent
        || (admissionNumber ? await this.studentRepository?.findByAdmissionNumber?.(admissionNumber) : null)
        || (studentId ? await this.studentRepository?.findByStudentId?.(studentId) : null);

      if (!student) {
        return ServiceResult.notFound('Student not found', {}, null, 'Student not found', 'STUDENT_NOT_FOUND');
      }

      if (String(student.status).toLowerCase() !== 'active') {
        return ServiceResult.accessDenied('Only current students may access attendance records', {}, null, 'Former students are not eligible for attendance lookup', 'FORMER_STUDENT');
      }

      const attendance = await this.attendanceRepository?.getAttendance?.({ studentId: student.id, admissionNumber: student.admissionNumber, parentId: context.parentId });
      const records = Array.isArray(attendance) ? attendance : attendance ? [attendance] : [];
      const presentCount = records.filter((item) => item.status === 'present' || item.status === 'Present').length;
      const absentCount = records.filter((item) => item.status === 'absent' || item.status === 'Absent').length;
      const totalCount = records.length;
      const attendanceSummary = {
        total: totalCount,
        present: presentCount,
        absent: absentCount,
        percentage: totalCount > 0 ? Number(((presentCount / totalCount) * 100).toFixed(2)) : 0
      };

      const normalized = {
        student: {
          id: student.id,
          studentId: student.studentId,
          admissionNumber: student.admissionNumber,
          status: student.status
        },
        attendance: records,
        summary: attendanceSummary
      };

      this.logger?.info?.('Service completed', { service: 'AttendanceService', action: 'getAttendance' });
      return ServiceResult.success(normalized, {}, authDecision, 'Attendance retrieved successfully', 'ATTENDANCE_FOUND');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'AttendanceService', action: 'getAttendance', error: error.message });
      return ServiceResult.fromError(error);
    }
  }
}
