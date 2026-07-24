import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { StudentRepository } from '../src/repositories/StudentRepository.js';
import { ParentRepository } from '../src/repositories/ParentRepository.js';
import { AttendanceRepository } from '../src/repositories/AttendanceRepository.js';
import { ResultsRepository } from '../src/repositories/ResultsRepository.js';
import { FeeRepository } from '../src/repositories/FeeRepository.js';
import { DisciplineRepository } from '../src/repositories/DisciplineRepository.js';
import { TicketRepository } from '../src/repositories/TicketRepository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const datasetPath = path.resolve(__dirname, '../../test-databases/green-valley-seed.json');

test('green valley seed exposes repository-compatible records', async () => {
  assert.ok(fs.existsSync(datasetPath), 'Expected generated green valley seed dataset');

  const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
  const connector = {
    async getStudent(payload = {}) {
      const studentId = payload.studentId || payload.admissionNumber;
      return dataset.students.find((student) => student.studentId === studentId || student.admissionNumber === studentId) || null;
    },
    async getStudentProfile(payload = {}) {
      const student = await this.getStudent(payload);
      return student ? { ...student, attendance: dataset.attendance.filter((item) => item.studentId === student.studentId), results: dataset.results.filter((item) => item.studentId === student.studentId), feeBalance: dataset.fees.find((item) => item.studentId === student.studentId), discipline: dataset.discipline.filter((item) => item.studentId === student.studentId) } : null;
    },
    async getParent(payload = {}) {
      const value = payload.parentId || payload.idNumber || payload.parentNumber || payload.phone;
      return dataset.parents.find((parent) => parent.parentId === value || parent.idNumber === value || parent.phone === value) || null;
    },
    async getAttendance(payload = {}) {
      return dataset.attendance.filter((item) => item.studentId === payload.studentId);
    },
    async getResults(payload = {}) {
      return dataset.results.filter((item) => item.studentId === payload.studentId);
    },
    async getFeeBalance(payload = {}) {
      return dataset.fees.find((item) => item.studentId === payload.studentId) || null;
    },
    async getDiscipline(payload = {}) {
      return dataset.discipline.filter((item) => item.studentId === payload.studentId);
    },
    async createTicket(payload = {}) {
      return { ok: true, ticket: payload };
    },
    async findTicket(payload = {}) {
      return dataset.tickets.filter((item) => item.studentId === payload.studentId || item.parentId === payload.parentId);
    },
    async execute({ operation, payload } = {}) {
      return this[operation]?.(payload);
    }
  };

  const studentRepository = new StudentRepository({ connector });
  const parentRepository = new ParentRepository({ connector });
  const attendanceRepository = new AttendanceRepository({ connector });
  const resultsRepository = new ResultsRepository({ connector });
  const feeRepository = new FeeRepository({ connector });
  const disciplineRepository = new DisciplineRepository({ connector });
  const ticketRepository = new TicketRepository({ connector });

  const student = await studentRepository.getStudent(dataset.students[0].studentId);
  assert.ok(student);
  assert.equal(student.admissionNumber, dataset.students[0].admissionNumber);

  const parent = await parentRepository.findByPhone(dataset.parents[0].phone);
  assert.ok(parent);
  assert.equal(parent.parentId, dataset.parents[0].parentId);

  const attendance = await attendanceRepository.getAttendance({ studentId: dataset.students[0].studentId });
  assert.ok(attendance.length > 0);

  const results = await resultsRepository.getResults({ studentId: dataset.students[0].studentId });
  assert.ok(results.length > 0);

  const feeBalance = await feeRepository.getFeeBalance({ studentId: dataset.students[0].studentId });
  assert.ok(feeBalance);

  const discipline = await disciplineRepository.getDiscipline({ studentId: dataset.students[0].studentId });
  assert.ok(discipline.length >= 0);

  const tickets = await ticketRepository.find({ studentId: dataset.students[0].studentId });
  assert.ok(tickets.length > 0);
});
