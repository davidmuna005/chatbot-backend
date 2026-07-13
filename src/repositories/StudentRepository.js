import { BaseRepository } from './BaseRepository.js';

export class StudentRepository extends BaseRepository {
  async getStudent(studentId) {
    const student = await this.callConnector('getStudent', { studentId });
    return this.normalizeStudent(student);
  }

  async findByAdmissionNumber(admissionNumber) {
    const student = await this.callConnector('getStudent', { admissionNumber });
    return this.normalizeStudent(student);
  }

  async findByStudentId(studentId) {
    const student = await this.callConnector('getStudent', { studentId });
    return this.normalizeStudent(student);
  }

  async exists(studentId) {
    const result = await this.callConnector('getStudent', { studentId });
    return Boolean(result);
  }

  async isCurrentStudent(studentId) {
    const result = await this.callConnector('getStudent', { studentId });
    return Boolean(result?.status === 'Active');
  }

  async getProfile(studentId) {
    const profile = await this.callConnector('getStudentProfile', { studentId });
    return this.normalizeProfile(profile);
  }

  async getParent(studentId) {
    const parent = await this.callConnector('getStudentProfile', { studentId });
    return this.normalizeParent(parent);
  }

  async create(payload) {
    return this.callConnector('createStudent', payload);
  }

  async update(payload) {
    return this.callConnector('updateStudent', payload);
  }

  async delete(studentId) {
    return this.callConnector('deleteStudent', { studentId });
  }

  normalizeStudent(student) {
    if (!student) {
      return null;
    }

    return {
      id: student.id ?? student.studentId,
      studentId: student.studentId ?? student.id,
      admissionNumber: student.admissionNumber,
      status: student.status
    };
  }

  normalizeProfile(profile) {
    if (!profile) {
      return null;
    }

    return {
      studentId: profile.studentId ?? profile.id,
      admissionNumber: profile.admissionNumber,
      status: profile.status,
      name: profile.name
    };
  }

  normalizeParent(parent) {
    if (!parent) {
      return null;
    }

    return {
      id: parent.id ?? parent.parentId,
      idNumber: parent.idNumber ?? parent.parentIdNumber,
      phone: parent.phone ?? parent.phoneNumber
    };
  }
}
