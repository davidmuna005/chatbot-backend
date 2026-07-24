import { BaseRepository } from './BaseRepository.js';

export class StudentRepository extends BaseRepository {
  async search({ searchTerm, searchBy = 'name' } = {}) {
    const seed = this.getFixtureSeed();
    if (!seed?.students?.length) {
      return [];
    }

    const query = (searchTerm || '').toString().trim().toLowerCase();
    const matches = seed.students.filter((student) => {
      if (!query) {
        return true;
      }

      const haystack = [student.name, student.studentId, student.admissionNumber, student.class, student.stream]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });

    return matches.map((student) => this.normalizeStudent(student));
  }

  async getStudent(studentId) {
    try {
      const student = await this.callConnector('getStudent', { studentId });
      if (student) {
        return this.normalizeStudent(student);
      }
    } catch (error) {
      this.logger?.warn?.('Connector unavailable for student lookup; using fixture seed', { error: error.message });
    }

    const fixtureStudent = this.findFixtureStudent(studentId);
    return this.normalizeStudent(fixtureStudent);
  }

  async findByAdmissionNumber(admissionNumber) {
    const fixtureStudent = this.findFixtureStudent(admissionNumber);
    if (fixtureStudent) {
      return this.normalizeStudent(fixtureStudent);
    }

    try {
      const student = await this.callConnector('getStudent', { admissionNumber });
      return this.normalizeStudent(student);
    } catch (error) {
      this.logger?.warn?.('Connector unavailable for student admission lookup; using fixture seed', { error: error.message });
      return null;
    }
  }

  async findByStudentId(studentId) {
    return this.getStudent(studentId);
  }

  async exists(studentId) {
    const result = await this.getStudent(studentId);
    return Boolean(result);
  }

  async isCurrentStudent(studentId) {
    const result = await this.getStudent(studentId);
    return Boolean(result?.status === 'Active');
  }

  async getProfile(studentId) {
    try {
      const profile = await this.callConnector('getStudentProfile', { studentId });
      if (profile) {
        return this.normalizeProfile(profile);
      }
    } catch (error) {
      this.logger?.warn?.('Connector unavailable for student profile lookup; using fixture seed', { error: error.message });
    }

    const fixtureStudent = this.findFixtureStudent(studentId);
    return this.normalizeProfile(fixtureStudent);
  }

  async getParent(studentId) {
    const profile = await this.getProfile(studentId);
    return this.normalizeParent(profile);
  }

  async getLinkedParents(studentId) {
    const seed = this.getFixtureSeed();
    if (!seed?.parents?.length) {
      return [];
    }

    const normalizedStudentId = studentId?.toString();
    const linkedParents = seed.parents.filter((parent) => {
      const linkedStudents = Array.isArray(parent.linkedStudents) ? parent.linkedStudents : [];
      return linkedStudents.includes(normalizedStudentId)
        || linkedStudents.includes(studentId)
        || linkedStudents.includes(this.findFixtureStudent(studentId)?.admissionNumber)
        || linkedStudents.includes(this.findFixtureStudent(studentId)?.id);
    });

    return linkedParents.map((parent) => this.normalizeParent(parent));
  }

  async create(payload) {
    const seed = this.getFixtureSeed();
    if (seed?.students) {
      const newStudent = {
        id: payload.id || payload.studentId || `student-${seed.students.length + 1}`,
        studentId: payload.studentId || payload.id || `S${String(seed.students.length + 1).padStart(3, '0')}`,
        admissionNumber: payload.admissionNumber || payload.admissionNo || `GVSS${String(seed.students.length + 1).padStart(3, '0')}`,
        name: payload.name || payload.fullName || 'New Student',
        fullName: payload.fullName || payload.name || 'New Student',
        gender: payload.gender || 'Unknown',
        class: payload.class || payload.grade || '',
        stream: payload.stream || '',
        status: payload.status || 'Active',
        parentId: payload.parentId || null,
      };

      seed.students.push(newStudent);
      return this.normalizeStudent(newStudent);
    }

    try {
      return await this.callConnector('createStudent', payload);
    } catch (error) {
      this.logger?.warn?.('Connector unavailable for student creation; returning local fallback', { error: error.message });
      return this.normalizeStudent(payload);
    }
  }

  async update(payload) {
    const seed = this.getFixtureSeed();
    if (seed?.students) {
      const targetId = payload.studentId || payload.id;
      const index = seed.students.findIndex((student) => student.studentId === targetId || student.id === targetId || student.admissionNumber === targetId);
      if (index >= 0) {
        seed.students[index] = {
          ...seed.students[index],
          ...payload,
          id: payload.id || seed.students[index].id,
          studentId: payload.studentId || seed.students[index].studentId,
        };
        return this.normalizeStudent(seed.students[index]);
      }
    }

    try {
      return await this.callConnector('updateStudent', payload);
    } catch (error) {
      this.logger?.warn?.('Connector unavailable for student update; returning local fallback', { error: error.message });
      return this.normalizeStudent(payload);
    }
  }

  async delete(studentId) {
    const seed = this.getFixtureSeed();
    if (seed?.students) {
      seed.students = seed.students.filter((student) => student.studentId !== studentId && student.id !== studentId && student.admissionNumber !== studentId);
      return true;
    }

    try {
      return await this.callConnector('deleteStudent', { studentId });
    } catch (error) {
      this.logger?.warn?.('Connector unavailable for student deletion', { error: error.message });
      return false;
    }
  }

  findFixtureStudent(identifier) {
    const seed = this.getFixtureSeed();
    if (!seed?.students?.length) {
      return null;
    }

    const value = (identifier || '').toString().trim().toLowerCase();
    return seed.students.find((student) => {
      if (!value) {
        return false;
      }

      const candidates = [student.studentId, student.id, student.admissionNumber, student.name, student.fullName];
      return candidates.some((candidate) => (candidate || '').toString().toLowerCase() === value || (candidate || '').toString().toLowerCase().includes(value));
    }) || null;
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

      const candidates = [parent.parentId, parent.id, parent.idNumber, parent.name, parent.fullName];
      return candidates.some((candidate) => (candidate || '').toString().toLowerCase() === value || (candidate || '').toString().toLowerCase().includes(value));
    }) || null;
  }

  normalizeStudent(student) {
    if (!student) {
      return null;
    }

    const parentId = student.parentId ?? student.guardianId ?? null;
    const linkedParents = Array.isArray(student.linkedParents) ? student.linkedParents : [];
    const fixtureParent = parentId ? this.findFixtureParent(parentId) : null;
    const parentProfile = fixtureParent ? this.normalizeParent(fixtureParent) : null;
    const parentName = student.parent || student.parentName || student.guardianName || parentProfile?.name || '';

    return {
      id: student.id ?? student.studentId,
      studentId: student.studentId ?? student.id,
      admissionNumber: student.admissionNumber ?? student.admissionNo ?? '',
      status: student.status ?? 'Active',
      fullName: student.fullName ?? student.name ?? '',
      name: student.name ?? student.fullName ?? '',
      class: student.class ?? student.grade ?? '',
      stream: student.stream ?? '',
      parentId,
      linkedParents,
      parent: parentName,
      parentName,
      parentProfile,
      ...student,
      parentId,
      linkedParents,
      parent: student.parent || student.parentName || student.guardianName || parentName || '',
      parentName: student.parentName || parentName || '',
      parentProfile: parentProfile || student.parentProfile || null,
    };
  }

  normalizeProfile(profile) {
    if (!profile) {
      return null;
    }

    const parentId = profile.parentId ?? profile.guardianId ?? null;
    const fixtureParent = parentId ? this.findFixtureParent(parentId) : null;
    const parentProfile = fixtureParent ? this.normalizeParent(fixtureParent) : null;
    const parentName = profile.parent || profile.parentName || profile.guardianName || parentProfile?.name || '';

    return {
      studentId: profile.studentId ?? profile.id ?? profile.admissionNumber,
      admissionNumber: profile.admissionNumber ?? profile.admissionNo ?? '',
      status: profile.status ?? 'Active',
      name: profile.name ?? profile.fullName ?? '',
      class: profile.class ?? profile.grade ?? '',
      stream: profile.stream ?? '',
      parentId,
      parent: parentName,
      parentName,
      parentProfile,
      ...profile,
      parentId,
      parent: profile.parent || profile.parentName || profile.guardianName || parentName || '',
      parentName: profile.parentName || parentName || '',
      parentProfile: parentProfile || profile.parentProfile || null,
    };
  }

  normalizeParent(parent) {
    if (!parent) {
      return null;
    }

    return {
      id: parent.id ?? parent.parentId,
      idNumber: parent.idNumber ?? parent.parentIdNumber,
      phone: parent.phone ?? parent.phoneNumber,
      ...parent,
    };
  }
}
