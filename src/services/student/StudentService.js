import { ServiceResult } from '../serviceResult.js';

export class StudentService {
  constructor({ studentRepository, formerStudentPolicy, logger } = {}) {
    this.studentRepository = studentRepository;
    this.formerStudentPolicy = formerStudentPolicy;
    this.logger = logger;
  }

  async getStudent({ admissionNumber, studentId }) {
    try {
      this.logger?.info?.('Service started', { service: 'StudentService', action: 'getStudent' });
      const student = admissionNumber
        ? await this.studentRepository?.findByAdmissionNumber?.(admissionNumber)
        : await this.studentRepository?.findByStudentId?.(studentId);

      const decision = this.formerStudentPolicy?.evaluate?.({ student });
      if (!decision?.allowed) {
        return ServiceResult.failure(
          'student-access-denied',
          { reason: decision?.reason ?? 'former-student' },
          decision,
          'Student access denied',
          'FORMER_STUDENT'
        );
      }

      this.logger?.info?.('Service completed', { service: 'StudentService', action: 'getStudent' });
      return ServiceResult.success(student, {}, decision, 'Student retrieved successfully', 'STUDENT_FOUND');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'StudentService', action: 'getStudent', error: error.message });
      return ServiceResult.fromError(error);
    }
  }
}
