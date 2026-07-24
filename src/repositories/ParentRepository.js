import { BaseRepository } from './BaseRepository.js';

export class ParentRepository extends BaseRepository {
  async search({ searchTerm } = {}) {
    const seed = this.getFixtureSeed();
    if (!seed?.parents?.length) {
      return [];
    }

    const query = (searchTerm || '').toString().trim().toLowerCase();
    const matches = seed.parents.filter((parent) => {
      if (!query) {
        return true;
      }

      const haystack = [parent.name, parent.parentId, parent.idNumber, parent.phone, parent.email]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });

    return matches.map((parent) => this.normalizeParent(parent));
  }

  async findByIdNumber(idNumber) {
    try {
      const parent = await this.callConnector('getParent', { idNumber });
      if (parent) {
        return this.normalizeParent(parent);
      }
    } catch (error) {
      this.logger?.warn?.('Connector unavailable for parent lookup by id number; using fixture seed', { error: error.message });
    }

    const fixtureParent = this.findFixtureParent(idNumber);
    return this.normalizeParent(fixtureParent);
  }

  async findByPhone(phone) {
    try {
      const parent = await this.callConnector('getParent', { phone });
      if (parent) {
        return this.normalizeParent(parent);
      }
    } catch (error) {
      this.logger?.warn?.('Connector unavailable for parent lookup by phone; using fixture seed', { error: error.message });
    }

    const fixtureParent = this.findFixtureParent(phone);
    return this.normalizeParent(fixtureParent);
  }

  async findByParentNumber(parentNumber) {
    try {
      const parent = await this.callConnector('getParent', { parentNumber });
      if (parent) {
        return this.normalizeParent(parent);
      }
    } catch (error) {
      this.logger?.warn?.('Connector unavailable for parent lookup by parent number; using fixture seed', { error: error.message });
    }

    const fixtureParent = this.findFixtureParent(parentNumber);
    return this.normalizeParent(fixtureParent);
  }

  async findLinkedStudents(parentId) {
    try {
      const students = await this.callConnector('getParent', { parentId });
      if (Array.isArray(students?.linkedStudents) && students.linkedStudents.length) {
        return students.linkedStudents.map((student) => this.normalizeStudent(student));
      }
    } catch (error) {
      this.logger?.warn?.('Connector unavailable for linked student lookup; using fixture seed', { error: error.message });
    }

    const seed = this.getFixtureSeed();
    if (seed?.parents?.length) {
      const parent = seed.parents.find((record) => record.parentId === parentId || record.id === parentId || record.idNumber === parentId);
      if (parent?.linkedStudents?.length) {
        const linkedStudents = seed.students.filter((student) => parent.linkedStudents.includes(student.studentId) || parent.linkedStudents.includes(student.id) || parent.linkedStudents.includes(student.admissionNumber));
        return linkedStudents.map((student) => this.normalizeStudent(student));
      }
    }

    if (seed?.students?.length) {
      const linkedStudents = seed.students.filter((student) => student.parentId === parentId || student.parentId === parentId?.toLowerCase?.());
      return linkedStudents.map((student) => this.normalizeStudent(student));
    }

    return [];
  }

  async exists(idNumber) {
    const result = await this.findByIdNumber(idNumber);
    return Boolean(result);
  }

  async create(payload) {
    const seed = this.getFixtureSeed();
    if (seed?.parents) {
      const newParent = {
        id: payload.id || payload.parentId || `parent-${seed.parents.length + 1}`,
        parentId: payload.parentId || payload.id || `P${String(seed.parents.length + 1).padStart(3, '0')}`,
        name: payload.name || payload.fullName || 'New Parent',
        email: payload.email || '',
        phone: payload.phone || '',
        idNumber: payload.idNumber || '',
        status: payload.status || 'Active',
        linkedStudents: [],
        verificationStatus: 'verified',
      };

      seed.parents.push(newParent);
      return this.normalizeParent(newParent);
    }

    try {
      return await this.callConnector('createParent', payload);
    } catch (error) {
      this.logger?.warn?.('Connector unavailable for parent creation; returning local fallback', { error: error.message });
      return this.normalizeParent(payload);
    }
  }

  async update(payload) {
    const seed = this.getFixtureSeed();
    if (seed?.parents) {
      const targetId = payload.id || payload.parentId;
      const index = seed.parents.findIndex((parent) => parent.parentId === targetId || parent.id === targetId);
      if (index >= 0) {
        seed.parents[index] = {
          ...seed.parents[index],
          ...payload,
          id: payload.id || seed.parents[index].id,
          parentId: payload.parentId || seed.parents[index].parentId,
        };
        return this.normalizeParent(seed.parents[index]);
      }
    }

    try {
      return await this.callConnector('updateParent', payload);
    } catch (error) {
      this.logger?.warn?.('Connector unavailable for parent update; returning local fallback', { error: error.message });
      return this.normalizeParent(payload);
    }
  }

  async delete(id) {
    const seed = this.getFixtureSeed();
    if (seed?.parents) {
      seed.parents = seed.parents.filter((parent) => parent.id !== id && parent.parentId !== id);
      return true;
    }

    try {
      return await this.callConnector('deleteParent', { id });
    } catch (error) {
      this.logger?.warn?.('Connector unavailable for parent deletion', { error: error.message });
      return false;
    }
  }

  findFixtureParent(identifier) {
    const seed = this.getFixtureSeed();
    if (!seed?.parents?.length) {
      return null;
    }

    const value = (identifier || '').toString().trim().toLowerCase();
    return seed.parents.find((parent) => {
      if (!value) {
        return false;
      }

      const candidates = [parent.parentId, parent.id, parent.idNumber, parent.phone, parent.email, parent.name];
      return candidates.some((candidate) => (candidate || '').toString().toLowerCase() === value || (candidate || '').toString().toLowerCase().includes(value));
    }) || null;
  }

  normalizeParent(parent) {
    if (!parent) {
      return null;
    }

    return {
      id: parent.id ?? parent.parentId ?? parent.idNumber,
      parentId: parent.parentId ?? parent.id ?? parent.idNumber,
      idNumber: parent.idNumber ?? parent.parentIdNumber ?? parent.parentId,
      phone: parent.phone ?? parent.phoneNumber,
      linkedStudents: Array.isArray(parent.linkedStudents) ? parent.linkedStudents : [],
      verificationStatus: parent.verificationStatus ?? 'verified',
      status: parent.status ?? 'Active',
      name: parent.name ?? parent.fullName ?? '',
      email: parent.email ?? '',
      ...parent,
    };
  }

  normalizeStudent(student) {
    return {
      id: student.id ?? student.studentId,
      studentId: student.studentId ?? student.id,
      admissionNumber: student.admissionNumber ?? student.admissionNo ?? '',
      name: student.name ?? student.fullName ?? '',
      class: student.class ?? student.grade ?? '',
      status: student.status ?? 'Active',
      ...student,
    };
  }
}
