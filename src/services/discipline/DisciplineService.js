import { ServiceResult } from '../serviceResult.js';

export class DisciplineService {
  constructor({ disciplineRepository, studentRepository, authorizationPolicy, logger } = {}) {
    this.disciplineRepository = disciplineRepository;
    this.studentRepository = studentRepository;
    this.authorizationPolicy = authorizationPolicy;
    this.logger = logger;
  }

  async getDiscipline({ context, admissionNumber, studentId } = {}) {
    try {
      this.logger?.info?.('Service started', { service: 'DisciplineService', action: 'getDiscipline' });

      if (!context?.authenticated) {
        return ServiceResult.accessDenied('Parent must be authenticated', {}, null, 'Authentication required to access discipline records', 'UNAUTHORIZED_PARENT');
      }

      const authDecision = this.authorizationPolicy?.evaluate?.({ user: { permissions: ['view-discipline'] }, permission: 'view-discipline' });
      if (!authDecision?.allowed) {
        return ServiceResult.accessDenied(authDecision?.reason ?? 'discipline-access-denied', {}, authDecision);
      }

      const student = context?.selectedStudent
        || (admissionNumber ? await this.studentRepository?.findByAdmissionNumber?.(admissionNumber) : null)
        || (studentId ? await this.studentRepository?.findByStudentId?.(studentId) : null);

      if (!student) {
        return ServiceResult.notFound('Student not found', {}, null, 'Student not found', 'STUDENT_NOT_FOUND');
      }

      if (String(student.status).toLowerCase() !== 'active') {
        return ServiceResult.accessDenied('Only current students may access discipline records', {}, null, 'Former students are not eligible for discipline lookup', 'FORMER_STUDENT');
      }

      const discipline = await this.disciplineRepository?.getDiscipline?.({ studentId: student.id, admissionNumber: student.admissionNumber, parentId: context.parentId });
      const records = Array.isArray(discipline) ? discipline : discipline ? [discipline] : [];
      const normalized = {
        student: {
          id: student.id,
          studentId: student.studentId,
          admissionNumber: student.admissionNumber,
          status: student.status
        },
        incidents: records,
        totalIncidents: records.length
      };

      this.logger?.info?.('Service completed', { service: 'DisciplineService', action: 'getDiscipline' });
      return ServiceResult.success(normalized, {}, authDecision, 'Discipline retrieved successfully', 'DISCIPLINE_FOUND');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'DisciplineService', action: 'getDiscipline', error: error.message });
      return ServiceResult.fromError(error);
    }
  }
}
