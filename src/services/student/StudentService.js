import { ServiceResult } from '../serviceResult.js';

export class StudentService {
  constructor({ studentRepository, formerStudentPolicy, authorizationPolicy, parentService, logger } = {}) {
    this.studentRepository = studentRepository;
    this.formerStudentPolicy = formerStudentPolicy;
    this.authorizationPolicy = authorizationPolicy;
    this.parentService = parentService;
    this.logger = logger;
  }

  async getStudent({ admissionNumber, studentId, parentId } = {}) {
    try {
      this.logger?.info?.('Service started', { service: 'StudentService', action: 'getStudent' });

      const student = admissionNumber
        ? await this.studentRepository?.findByAdmissionNumber?.(admissionNumber)
        : await this.studentRepository?.findByStudentId?.(studentId);

      if (!student) {
        return ServiceResult.notFound('Student not found', {}, null, 'Student not found', 'STUDENT_NOT_FOUND');
      }

      const formerDecision = this.formerStudentPolicy?.evaluate?.({ student });
      if (!formerDecision?.allowed) {
        return ServiceResult.failure(
          'student-access-denied',
          { reason: formerDecision?.reason ?? 'former-student' },
          formerDecision,
          'Student access denied',
          'FORMER_STUDENT'
        );
      }

      if (!parentId) {
        return ServiceResult.accessDenied('Parent authentication required', {}, null, 'Parent authentication required', 'UNAUTHORIZED_PARENT');
      }

      const permissionCheck = this.authorizationPolicy?.evaluate?.({ user: { permissions: ['view-student'] }, permission: 'view-student' }) ?? { allowed: true };
      if (!permissionCheck?.allowed) {
        return ServiceResult.accessDenied(permissionCheck?.reason ?? 'student-access-denied', {}, permissionCheck);
      }

      const ownershipResult = await this.parentService?.verifyStudentOwnership?.({ parentId, admissionNumber: student.admissionNumber, studentId: student.id });
      if (!ownershipResult?.success) {
        return ownershipResult;
      }

      this.logger?.info?.('Service completed', { service: 'StudentService', action: 'getStudent' });
      return ServiceResult.success(student, {}, formerDecision, 'Student retrieved successfully', 'STUDENT_FOUND');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'StudentService', action: 'getStudent', error: error.message });
      return ServiceResult.fromError(error);
    }
  }
}
