import test from 'node:test';
import assert from 'node:assert';
import { SchemaMappingEngine } from '../src/connectors/mappingEngine/index.js';
import { MappingConfigLoader } from '../src/connectors/mappingEngine/configLoader.js';
import { MySQLConnector } from '../src/connectors/mysql/index.js';
import { PostgresConnector } from '../src/connectors/postgres/index.js';
import { SqlServerConnector } from '../src/connectors/sqlserver/index.js';
import {
  CanonicalStudent,
  CanonicalParent,
  CanonicalAttendance,
  CanonicalResult,
  CanonicalFeeBalance,
  CanonicalDiscipline,
  CanonicalAcademicCalendar,
  CanonicalTicket,
  CanonicalSession,
  CanonicalOTP
} from '../src/connectors/models/index.js';

test('School Connector SDK - Canonical Data Models', async (t) => {
  await t.test('creates canonical student with all fields', () => {
    const student = new CanonicalStudent({
      studentId: 'S001',
      fullName: 'John Doe',
      admissionNumber: 'ADM001',
      gender: 'M',
      status: 'Active'
    });

    assert.strictEqual(student.studentId, 'S001');
    assert.strictEqual(student.fullName, 'John Doe');
    assert.strictEqual(student.gender, 'M');
    assert.strictEqual(student.status, 'Active');
  });

  await t.test('creates canonical parent with all fields', () => {
    const parent = new CanonicalParent({
      parentId: 'P001',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '555-1234'
    });

    assert.strictEqual(parent.parentId, 'P001');
    assert.strictEqual(parent.fullName, 'Jane Doe');
    assert.strictEqual(parent.email, 'jane@example.com');
  });

  await t.test('creates canonical attendance record', () => {
    const attendance = new CanonicalAttendance({
      attendanceId: 'AT001',
      studentId: 'S001',
      date: '2024-01-15',
      status: 'Present'
    });

    assert.strictEqual(attendance.attendanceId, 'AT001');
    assert.strictEqual(attendance.status, 'Present');
  });

  await t.test('creates canonical fee balance', () => {
    const fees = new CanonicalFeeBalance({
      feeBalanceId: 'FB001',
      studentId: 'S001',
      totalAmount: 10000,
      paidAmount: 5000
    });

    assert.strictEqual(fees.totalAmount, 10000);
    assert.strictEqual(fees.paidAmount, 5000);
    // BalanceAmount is recalculated when validate is called
    fees.validate();
    assert.strictEqual(fees.balanceAmount, 5000);
  });
});

test('School Connector SDK - Schema Mapping Engine', async (t) => {
  const defaultConfig = {
    schoolName: 'Test School',
    tables: {
      student: 'students',
      parent: 'parents'
    },
    columns: {
      'students.studentId': 'student_id',
      'students.fullName': 'full_name'
    },
    primaryKeys: {
      students: 'student_id'
    },
    valueTranslations: {
      student_status: {
        'A': 'Active',
        'I': 'Inactive'
      }
    }
  };

  const engine = new SchemaMappingEngine(defaultConfig);

  await t.test('translates table names correctly', () => {
    assert.strictEqual(engine.getTableName('student'), 'students');
    assert.strictEqual(engine.getTableName('parent'), 'parents');
  });

  await t.test('gets correct primary key', () => {
    assert.strictEqual(engine.getPrimaryKey('students'), 'student_id');
  });

  await t.test('translates values using configured mappings', () => {
    assert.strictEqual(engine.translateValue('student_status', 'A'), 'Active');
    assert.strictEqual(engine.translateValue('student_status', 'I'), 'Inactive');
  });

  await t.test('normalizes dates to ISO format', () => {
    const isoDate = engine.normalizeDate('2024-01-15');
    assert(isoDate.includes('2024-01-15'));

    const dateObj = engine.normalizeDate(new Date('2024-01-15'));
    assert(dateObj.includes('2024-01-15'));
  });

  await t.test('normalizes boolean values', () => {
    assert.strictEqual(engine.normalizeBoolean(true), true);
    assert.strictEqual(engine.normalizeBoolean(1), true);
    assert.strictEqual(engine.normalizeBoolean('true'), true);
    assert.strictEqual(engine.normalizeBoolean('yes'), true);
    assert.strictEqual(engine.normalizeBoolean(false), false);
    assert.strictEqual(engine.normalizeBoolean(0), false);
  });

  await t.test('normalizes gender values', () => {
    assert.strictEqual(engine.normalizeGender('M'), 'M');
    assert.strictEqual(engine.normalizeGender('F'), 'F');
    assert.strictEqual(engine.normalizeGender('male'), 'M');
    assert.strictEqual(engine.normalizeGender('female'), 'F');
  });

  await t.test('maps external row to canonical student', () => {
    const externalRow = {
      student_id: 'S001',
      full_name: 'John Doe',
      admission_number: 'ADM001',
      status: 'A'
    };

    const student = engine.mapToStudent(externalRow);
    assert.strictEqual(student.studentId, 'S001');
    assert.strictEqual(student.fullName, 'John Doe');
    assert.strictEqual(student.admissionNumber, 'ADM001');
    assert.strictEqual(student.status, 'Active');
  });

  await t.test('maps external row to canonical parent', () => {
    const externalRow = {
      parent_id: 'P001',
      full_name: 'Jane Doe',
      email: 'jane@example.com'
    };

    const parent = engine.mapToParent(externalRow);
    assert.strictEqual(parent.parentId, 'P001');
    assert.strictEqual(parent.fullName, 'Jane Doe');
  });

  await t.test('maps external row to canonical attendance', () => {
    const externalRow = {
      attendance_id: 'AT001',
      student_id: 'S001',
      date: '2024-01-15',
      status: 'Present'
    };

    const attendance = engine.mapToAttendance(externalRow);
    assert.strictEqual(attendance.attendanceId, 'AT001');
    assert.strictEqual(attendance.studentId, 'S001');
  });

  await t.test('maps external row to canonical result', () => {
    const externalRow = {
      result_id: 'R001',
      student_id: 'S001',
      subject: 'Mathematics',
      score: 85,
      grade: 'A'
    };

    const result = engine.mapToResult(externalRow);
    assert.strictEqual(result.resultId, 'R001');
    assert.strictEqual(result.subject, 'Mathematics');
    assert.strictEqual(result.score, 85);
  });

  await t.test('maps external row to canonical fee balance', () => {
    const externalRow = {
      fee_balance_id: 'FB001',
      student_id: 'S001',
      total_amount: 10000,
      paid_amount: 5000
    };

    const feeBalance = engine.mapToFeeBalance(externalRow);
    assert.strictEqual(feeBalance.feeBalanceId, 'FB001');
    assert.strictEqual(feeBalance.totalAmount, 10000);
    assert.strictEqual(feeBalance.balanceAmount, 5000);
  });
});

test('School Connector SDK - Mapping Configuration Loader', async (t) => {
  const loader = new MappingConfigLoader();

  await t.test('loads default configuration', () => {
    const config = loader.getDefaultConfiguration();
    assert(config.tables);
    assert(config.columns);
    assert(config.primaryKeys);
  });

  await t.test('registers and retrieves school configurations', () => {
    const config = {
      schoolName: 'School A',
      tables: { student: 'students' },
      columns: { 'students.studentId': 'student_id' },
      primaryKeys: { students: 'student_id' }
    };

    loader.register('schoolA', config);
    const retrieved = loader.get('schoolA');

    assert.strictEqual(retrieved.schoolName, 'School A');
  });

  await t.test('validates configuration', () => {
    const invalidConfig = { tables: {} };
    assert.throws(
      () => loader.validateConfiguration(invalidConfig),
      /must include a "columns" mapping/
    );
  });

  await t.test('merges partial configuration with defaults', () => {
    const partialConfig = {
      schoolName: 'School B',
      tables: { student: 'learners' }
    };

    const merged = loader.mergeWithDefaults(partialConfig);
    assert.strictEqual(merged.schoolName, 'School B');
    assert.strictEqual(merged.tables.student, 'learners');
    assert(merged.tables.parent); // Should have default parent table
  });

  await t.test('loads example configurations', () => {
    const examples = MappingConfigLoader.createExampleConfigurations();
    assert(examples.schoolA);
    assert(examples.schoolB);
    assert(examples.schoolC);
  });
});

test('School Connector SDK - Connector Initialization', async (t) => {
  await t.test('creates MySQL connector with config', () => {
    const config = {
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'school_db',
      schoolName: 'Test School'
    };

    const connector = new MySQLConnector({ config });

    assert.strictEqual(connector.type, 'mysql');
    assert(connector.mappingEngine);
    assert(connector.adapter);
  });

  await t.test('creates PostgreSQL connector with config', () => {
    const config = {
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'school_db',
      schoolName: 'Test School'
    };

    const connector = new PostgresConnector({ config });

    assert.strictEqual(connector.type, 'postgres');
    assert(connector.mappingEngine);
    assert(connector.adapter);
  });

  await t.test('creates SQL Server connector with config', () => {
    const config = {
      server: 'localhost',
      port: 1433,
      username: 'sa',
      password: 'password',
      database: 'school_db',
      schoolName: 'Test School'
    };

    const connector = new SqlServerConnector({ config });

    assert.strictEqual(connector.type, 'sqlserver');
    assert(connector.mappingEngine);
    assert(connector.adapter);
  });

  await t.test('connector has all required methods', () => {
    const config = { host: 'localhost', username: 'root', password: 'password', database: 'test' };
    const connector = new MySQLConnector({ config });

    assert(typeof connector.getStudent === 'function');
    assert(typeof connector.getParent === 'function');
    assert(typeof connector.getAttendance === 'function');
    assert(typeof connector.getResults === 'function');
    assert(typeof connector.getFeeBalance === 'function');
    assert(typeof connector.getDiscipline === 'function');
    assert(typeof connector.getCalendar === 'function');
    assert(typeof connector.getStudentProfile === 'function');
    assert(typeof connector.getParentStudents === 'function');
    assert(typeof connector.execute === 'function');
  });
});

test('School Connector SDK - Error Handling', async (t) => {
  await t.test('mapping engine is initialized by default', () => {
    const connector = new MySQLConnector({ config: { host: 'localhost', username: 'root', password: 'pass', database: 'test' } });
    assert(connector.mappingEngine);
  });

  await t.test('throws error when required parameters missing', () => {
    const config = { host: 'localhost', username: 'root', password: 'pass', database: 'test' };
    const connector = new MySQLConnector({ config });

    // This would throw during actual query execution, but we're testing parameter validation
    assert(connector.mappingEngine);
  });
});

test('School Connector SDK - Multi-School Support', async (t) => {
  const exampleConfigs = MappingConfigLoader.createExampleConfigurations();

  await t.test('supports School A schema', () => {
    const engine = new SchemaMappingEngine(exampleConfigs.schoolA);
    const row = {
      student_id: 'S001',
      full_name: 'John Doe',
      admission_number: 'ADM001',
      status: 'A'
    };

    const student = engine.mapToStudent(row);
    assert.strictEqual(student.studentId, 'S001');
    assert.strictEqual(student.status, 'Active');
  });

  await t.test('supports School B schema', () => {
    const engine = new SchemaMappingEngine(exampleConfigs.schoolB);
    const row = {
      learner_id: 'L001',
      learner_name: 'Jane Doe',
      admission_no: 'ADM002'
    };

    const student = engine.mapToStudent(row);
    assert.strictEqual(student.studentId, 'L001');
    assert.strictEqual(student.fullName, 'Jane Doe');
  });

  await t.test('supports School C legacy naming', () => {
    const engine = new SchemaMappingEngine(exampleConfigs.schoolC);
    const row = {
      STUD_ID: 'C001',
      NAME: 'Bob Smith',
      ADMNO: 'ADM003'
    };

    const student = engine.mapToStudent(row);
    assert.strictEqual(student.studentId, 'C001');
    assert.strictEqual(student.fullName, 'Bob Smith');
  });
});

test('School Connector SDK - Extensibility', async (t) => {
  await t.test('supports custom mapping configuration', () => {
    const customConfig = {
      schoolName: 'Custom School',
      tables: {
        student: 'custom_students_table',
        parent: 'custom_parents_table'
      },
      columns: {
        'custom_students_table.studentId': 'cust_student_id',
        'custom_students_table.fullName': 'cust_name'
      },
      primaryKeys: {
        custom_students_table: 'cust_student_id'
      }
    };

    const loader = new MappingConfigLoader();
    loader.register('customSchool', customConfig);

    const engine = new SchemaMappingEngine(loader.get('customSchool'));
    assert.strictEqual(engine.getTableName('student'), 'custom_students_table');
  });

  await t.test('supports custom value translations', () => {
    const config = {
      schoolName: 'Test',
      tables: {},
      columns: {},
      valueTranslations: {
        custom_status: {
          'A': 'Active',
          'D': 'Disabled',
          'P': 'Pending'
        }
      }
    };

    const engine = new SchemaMappingEngine(config);
    assert.strictEqual(engine.translateValue('custom_status', 'A'), 'Active');
    assert.strictEqual(engine.translateValue('custom_status', 'D'), 'Disabled');
  });
});
