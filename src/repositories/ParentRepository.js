import { BaseRepository } from './BaseRepository.js';

export class ParentRepository extends BaseRepository {
  async findByIdNumber(idNumber) {
    const parent = await this.callConnector('getParent', { idNumber });
    return this.normalizeParent(parent);
  }

  async findByPhone(phone) {
    const parent = await this.callConnector('getParent', { phone });
    return this.normalizeParent(parent);
  }

  async findByParentNumber(parentNumber) {
    const parent = await this.callConnector('getParent', { parentNumber });
    return this.normalizeParent(parent);
  }

  async findLinkedStudents(parentId) {
    const students = await this.callConnector('getParent', { parentId });
    return Array.isArray(students?.linkedStudents) ? students.linkedStudents.map((student) => this.normalizeStudent(student)) : [];
  }

  async exists(idNumber) {
    const result = await this.callConnector('getParent', { idNumber });
    return Boolean(result);
  }

  async create(payload) {
    return this.callConnector('createParent', payload);
  }

  async update(payload) {
    return this.callConnector('updateParent', payload);
  }

  async delete(id) {
    return this.callConnector('deleteParent', { id });
  }

  normalizeParent(parent) {
    if (!parent) {
      return null;
    }

    return {
      id: parent.id ?? parent.parentId,
      idNumber: parent.idNumber ?? parent.parentIdNumber,
      phone: parent.phone ?? parent.phoneNumber,
      linkedStudents: Array.isArray(parent.linkedStudents) ? parent.linkedStudents : []
    };
  }

  normalizeStudent(student) {
    return {
      id: student.id ?? student.studentId,
      studentId: student.studentId ?? student.id,
      admissionNumber: student.admissionNumber
    };
  }
}
