import { BaseRepository } from './BaseRepository.js';

export class AttendanceRepository extends BaseRepository {
  async getAttendance(payload = {}) {
    return this.execute('getAttendance', payload);
  }

  async getAttendanceSummary(payload = {}) {
    return this.execute('getAttendanceSummary', payload);
  }

  async getAttendanceByTerm(payload = {}) {
    return this.execute('getAttendanceByTerm', payload);
  }
}
