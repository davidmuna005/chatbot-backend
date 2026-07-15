import { ServiceResult } from '../serviceResult.js';

export class ParentService {
  constructor({ parentRepository, authorizationPolicy, logger } = {}) {
    this.parentRepository = parentRepository;
    this.authorizationPolicy = authorizationPolicy;
    this.logger = logger;
  }

  async getParent({ idNumber, phone, parentId } = {}) {
    try {
      this.logger?.info?.('Service started', { service: 'ParentService', action: 'getParent' });

      const parent = idNumber
        ? await this.parentRepository?.findByIdNumber?.(idNumber)
        : parentId
        ? await this.parentRepository?.findByParentNumber?.(parentId)
        : await this.parentRepository?.findByPhone?.(phone);

      if (!parent) {
        return ServiceResult.notFound('Parent not found', {}, null, 'Parent not found', 'PARENT_NOT_FOUND');
      }

      const decision = this.authorizationPolicy?.evaluate?.({ user: { permissions: ['view-parent'] }, permission: 'view-parent' });
      if (!decision?.allowed) {
        return ServiceResult.accessDenied(decision?.reason ?? 'parent-access-denied', {}, decision);
      }

      this.logger?.info?.('Service completed', { service: 'ParentService', action: 'getParent' });
      return ServiceResult.success(parent, {}, decision, 'Parent retrieved successfully', 'PARENT_FOUND');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'ParentService', action: 'getParent', error: error.message });
      return ServiceResult.fromError(error);
    }
  }

  async getParentProfile({ parentId, idNumber, phone } = {}) {
    const result = await this.getParent({ parentId, idNumber, phone });
    if (!result.success) {
      return result;
    }

    const linkedStudentsResult = await this.getLinkedStudents(result.data.id);
    if (!linkedStudentsResult.success) {
      return linkedStudentsResult;
    }

    return ServiceResult.success(
      {
        ...result.data,
        linkedStudents: linkedStudentsResult.data
      },
      result.metadata,
      result.decision,
      'Parent profile retrieved successfully',
      'PARENT_PROFILE_FOUND'
    );
  }

  async getLinkedStudents(parentId) {
    try {
      if (!parentId) {
        return ServiceResult.validationFailed('Parent ID is required to retrieve linked students');
      }

      const students = await this.parentRepository?.findLinkedStudents?.(parentId);
      return ServiceResult.success(students || [], {}, null, 'Linked students retrieved successfully', 'LINKED_STUDENTS_FOUND');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'ParentService', action: 'getLinkedStudents', error: error.message });
      return ServiceResult.fromError(error);
    }
  }

  async verifyStudentOwnership({ parentId, admissionNumber, studentId } = {}) {
    try {
      if (!parentId) {
        return ServiceResult.accessDenied('Parent authentication required', {}, null, 'Parent authentication required', 'UNAUTHORIZED_PARENT');
      }

      const linkedStudentsResult = await this.getLinkedStudents(parentId);
      if (!linkedStudentsResult.success) {
        return linkedStudentsResult;
      }

      const ownsStudent = linkedStudentsResult.data.some((student) => {
        if (studentId && student.id === studentId) {
          return true;
        }
        if (admissionNumber && student.admissionNumber === admissionNumber) {
          return true;
        }
        return false;
      });

      if (!ownsStudent) {
        return ServiceResult.accessDenied('Student is not linked to this parent', {}, null, 'Parent does not own the requested student', 'STUDENT_OWNERSHIP_FAILED');
      }

      return ServiceResult.success({ verified: true }, {}, null, 'Parent owns the student', 'STUDENT_OWNERSHIP_VERIFIED');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'ParentService', action: 'verifyStudentOwnership', error: error.message });
      return ServiceResult.fromError(error);
    }
  }

  async createPhoneUpdateRequest({ parentId, phone }) {
    try {
      if (!parentId || !phone) {
        return ServiceResult.validationFailed('Parent ID and phone are required');
      }

      return ServiceResult.success({ parentId, phone, requestedAt: new Date().toISOString() }, {}, null, 'Phone update request created', 'PHONE_UPDATE_REQUESTED');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'ParentService', action: 'createPhoneUpdateRequest', error: error.message });
      return ServiceResult.fromError(error);
    }
  }
}
