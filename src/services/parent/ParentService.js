import { ServiceResult } from '../serviceResult.js';

export class ParentService {
  constructor({ parentRepository, authorizationPolicy, logger } = {}) {
    this.parentRepository = parentRepository;
    this.authorizationPolicy = authorizationPolicy;
    this.logger = logger;
  }

  async getParent({ idNumber, phone }) {
    try {
      this.logger?.info?.('Service started', { service: 'ParentService', action: 'getParent' });
      const parent = idNumber
        ? await this.parentRepository?.findByIdNumber?.(idNumber)
        : await this.parentRepository?.findByPhone?.(phone);

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

  async getLinkedStudents(parentId) {
    try {
      const students = await this.parentRepository?.findLinkedStudents?.(parentId);
      return ServiceResult.success(students, {}, null, 'Linked students retrieved successfully', 'LINKED_STUDENTS_FOUND');
    } catch (error) {
      return ServiceResult.fromError(error);
    }
  }

  async createPhoneUpdateRequest({ parentId, phone }) {
    try {
      return ServiceResult.success({ parentId, phone, requestedAt: new Date().toISOString() }, {}, null, 'Phone update request created', 'PHONE_UPDATE_REQUESTED');
    } catch (error) {
      return ServiceResult.fromError(error);
    }
  }
}
