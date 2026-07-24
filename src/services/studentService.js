/**
 * Student Service
 * Handles student-related operations through the connector-backed repository layer.
 */

import { StudentRepository } from '../repositories/StudentRepository.js';
import { ServiceResult } from './serviceResult.js';

export class StudentService {
  constructor({ database, connectorRegistry, logger, studentRepository } = {}) {
    this.database = database;
    this.connectorRegistry = connectorRegistry;
    this.logger = logger;
    this.studentRepository = studentRepository || new StudentRepository({ registry: connectorRegistry, logger });
  }

  async searchStudents(filters = {}, limit = 50, offset = 0) {
    try {
      const { searchTerm, searchBy = 'name' } = filters;
      const searchValue = (searchTerm || '').toString().trim().toLowerCase();
      let data = [];

      if (typeof this.studentRepository.search === 'function') {
        const searchResult = await this.studentRepository.search({ searchTerm: searchValue, searchBy });
        data = Array.isArray(searchResult) ? searchResult : searchResult?.data || [];
      } else if (searchValue) {
        const student = await this.studentRepository.findByAdmissionNumber(searchValue);
        data = student ? [student] : [];
      }

      const normalizedData = data.map((item) => {
        const linkedParents = Array.isArray(item?.linkedParents) ? item.linkedParents : [];
        const parentName = item?.parentName || item?.parent || linkedParents.find((parent) => parent?.name)?.name || '';

        return {
          id: item?.id || item?.studentId || item?.admissionNumber || `student-${Math.random().toString(36).slice(2,8)}`,
          studentId: item?.studentId || item?.id,
          name: item?.fullName || item?.name || 'Student',
          admissionNo: item?.admissionNumber || item?.admissionNo || '',
          admissionNumber: item?.admissionNumber || item?.admissionNo || '',
          class: item?.class || item?.grade || '',
          parent: parentName,
          linkedParents,
          parentCount: linkedParents.length || (item?.parentId ? 1 : 0),
          status: (item?.status || 'Active').toLowerCase(),
          ...item,
          parent: parentName,
          linkedParents,
          parentCount: linkedParents.length || (item?.parentId ? 1 : 0),
          status: (item?.status || 'Active').toLowerCase(),
        };
      });

      return {
        success: true,
        data: normalizedData,
        total: normalizedData.length,
        limit,
        offset,
      };
    } catch (error) {
      this.logger?.error?.('Failed to search students', { error: error.message });
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  async getStudentProfile(studentId) {
    try {
      const profile = await this.studentRepository.getProfile(studentId);
      const normalizedProfile = profile ? {
        id: profile.studentId || profile.id || studentId,
        studentId: profile.studentId || profile.id || studentId,
        name: profile.name || profile.fullName || `Student ${profile.studentId || profile.id || studentId}`,
        admissionNo: profile.admissionNumber || profile.admissionNo || '',
        admissionNumber: profile.admissionNumber || profile.admissionNo || '',
        class: profile.class || profile.grade || '',
        parent: profile.parentName || profile.parent || '',
        ...profile,
        status: (profile.status || 'Active').toLowerCase(),
      } : null;

      return {
        success: true,
        data: normalizedProfile,
      };
    } catch (error) {
      this.logger?.error?.('Failed to get student profile', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getStudentStatus(studentId) {
    try {
      const student = await this.studentRepository.getStudent(studentId);
      return {
        success: true,
        data: {
          status: student?.status || 'current',
          enrollmentDate: null,
        },
      };
    } catch (error) {
      this.logger?.error?.('Failed to get student status', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getAttendance(studentId, filters = {}) {
    try {
      const attendance = await this.connectorRegistry?.getActiveConnector?.().getAttendance?.({ studentId, ...filters }) || [];
      return {
        success: true,
        data: attendance,
      };
    } catch (error) {
      this.logger?.error?.('Failed to get attendance', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getResults(studentId, filters = {}) {
    try {
      const results = await this.connectorRegistry?.getActiveConnector?.().getResults?.({ studentId, ...filters }) || [];
      return {
        success: true,
        data: results,
      };
    } catch (error) {
      this.logger?.error?.('Failed to get results', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getFeeBalance(studentId, filters = {}) {
    try {
      const feeBalance = await this.connectorRegistry?.getActiveConnector?.().getFeeBalance?.({ studentId, ...filters }) || null;
      return {
        success: true,
        data: feeBalance,
      };
    } catch (error) {
      this.logger?.error?.('Failed to get fee balance', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getDiscipline(studentId) {
    try {
      const discipline = await this.connectorRegistry?.getActiveConnector?.().getDiscipline?.({ studentId }) || [];
      return {
        success: true,
        data: discipline,
      };
    } catch (error) {
      this.logger?.error?.('Failed to get discipline', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async create(payload) {
    try {
      const result = await this.studentRepository.create(payload);
      return ServiceResult.success(result, {}, null, 'Student created', 'STUDENT_CREATED');
    } catch (error) {
      this.logger?.error?.('Failed to create student', { error: error.message });
      return ServiceResult.fromError(error);
    }
  }

  async update(studentId, payload) {
    try {
      const result = await this.studentRepository.update({ studentId, ...payload });
      return ServiceResult.success(result, {}, null, 'Student updated', 'STUDENT_UPDATED');
    } catch (error) {
      this.logger?.error?.('Failed to update student', { error: error.message });
      return ServiceResult.fromError(error);
    }
  }
}
