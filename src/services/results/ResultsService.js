import { ServiceResult } from '../serviceResult.js';

export class ResultsService {
  constructor({ resultsRepository, studentRepository, authorizationPolicy, logger } = {}) {
    this.resultsRepository = resultsRepository;
    this.studentRepository = studentRepository;
    this.authorizationPolicy = authorizationPolicy;
    this.logger = logger;
  }

  async getResults({ context, admissionNumber, studentId } = {}) {
    try {
      this.logger?.info?.('Service started', { service: 'ResultsService', action: 'getResults' });

      if (!context?.authenticated) {
        return ServiceResult.accessDenied('Parent must be authenticated', {}, null, 'Authentication required to access results', 'UNAUTHORIZED_PARENT');
      }

      const authDecision = this.authorizationPolicy?.evaluate?.({ user: { permissions: ['view-results'] }, permission: 'view-results' });
      if (!authDecision?.allowed) {
        return ServiceResult.accessDenied(authDecision?.reason ?? 'results-access-denied', {}, authDecision);
      }

      const student = context?.selectedStudent
        || (admissionNumber ? await this.studentRepository?.findByAdmissionNumber?.(admissionNumber) : null)
        || (studentId ? await this.studentRepository?.findByStudentId?.(studentId) : null);

      if (!student) {
        return ServiceResult.notFound('Student not found', {}, null, 'Student not found', 'STUDENT_NOT_FOUND');
      }

      if (String(student.status).toLowerCase() !== 'active') {
        return ServiceResult.accessDenied('Only current students may access academic results', {}, null, 'Former students are not eligible for results lookup', 'FORMER_STUDENT');
      }

      const results = await this.resultsRepository?.getResults?.({ studentId: student.id, admissionNumber: student.admissionNumber, parentId: context.parentId });
      const normalized = {
        student: {
          id: student.id,
          studentId: student.studentId,
          admissionNumber: student.admissionNumber,
          status: student.status
        },
        results: Array.isArray(results) ? results : results ? [results] : []
      };

      this.logger?.info?.('Service completed', { service: 'ResultsService', action: 'getResults' });
      return ServiceResult.success(normalized, {}, authDecision, 'Results retrieved successfully', 'RESULTS_FOUND');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'ResultsService', action: 'getResults', error: error.message });
      return ServiceResult.fromError(error);
    }
  }
}
