/**
 * Mapping Configuration Loader
 * 
 * Loads and validates school-specific mapping configurations.
 * These configurations define how to translate each school's schema to canonical models.
 */

import { ConnectorConfigurationError } from '../errors.js';

export class MappingConfigLoader {
  constructor(logger) {
    this.logger = logger;
    this.configurations = new Map();
  }

  /**
   * Register a mapping configuration for a school
   */
  register(schoolName, config) {
    if (!schoolName) {
      throw new ConnectorConfigurationError('School name is required for mapping configuration');
    }

    this.validateConfiguration(config);
    this.configurations.set(schoolName, config);
    this.logger?.info?.('Mapping configuration registered', { school: schoolName });

    return this;
  }

  /**
   * Get a mapping configuration for a school
   */
  get(schoolName) {
    if (!this.configurations.has(schoolName)) {
      this.logger?.warn?.('No mapping configuration found for school', { school: schoolName });
      return this.getDefaultConfiguration();
    }

    return this.configurations.get(schoolName);
  }

  /**
   * Validate a mapping configuration
   */
  validateConfiguration(config) {
    if (!config || typeof config !== 'object') {
      throw new ConnectorConfigurationError('Configuration must be an object');
    }

    if (!config.tables || typeof config.tables !== 'object') {
      throw new ConnectorConfigurationError('Configuration must include a "tables" mapping');
    }

    if (!config.columns || typeof config.columns !== 'object') {
      throw new ConnectorConfigurationError('Configuration must include a "columns" mapping');
    }

    if (!config.primaryKeys || typeof config.primaryKeys !== 'object') {
      throw new ConnectorConfigurationError('Configuration must include a "primaryKeys" mapping');
    }

    return true;
  }

  /**
   * Get default configuration
   * Used when no school-specific config is available
   */
  getDefaultConfiguration() {
    return {
      schoolName: 'Unknown',
      tables: {
        student: 'students',
        parent: 'parents',
        attendance: 'attendance',
        result: 'results',
        feeBalance: 'fee_balances',
        discipline: 'discipline',
        academicCalendar: 'academic_calendar',
        ticket: 'tickets',
        session: 'sessions',
        otp: 'otp'
      },
      columns: {},
      primaryKeys: {
        students: 'student_id',
        parents: 'parent_id',
        attendance: 'attendance_id',
        results: 'result_id',
        fee_balances: 'fee_balance_id',
        discipline: 'discipline_id',
        academic_calendar: 'calendar_id',
        tickets: 'ticket_id',
        sessions: 'session_id',
        otp: 'otp_id'
      },
      valueTranslations: {},
      dateFormats: {
        default: 'ISO'
      },
      booleanFormats: {}
    };
  }

  /**
   * Merge a partial configuration with defaults
   */
  mergeWithDefaults(partialConfig) {
    const defaults = this.getDefaultConfiguration();
    return {
      schoolName: partialConfig.schoolName || defaults.schoolName,
      tables: { ...defaults.tables, ...partialConfig.tables },
      columns: { ...defaults.columns, ...partialConfig.columns },
      primaryKeys: { ...defaults.primaryKeys, ...partialConfig.primaryKeys },
      valueTranslations: { ...defaults.valueTranslations, ...partialConfig.valueTranslations },
      dateFormats: { ...defaults.dateFormats, ...partialConfig.dateFormats },
      booleanFormats: { ...defaults.booleanFormats, ...partialConfig.booleanFormats }
    };
  }

  /**
   * Create a configuration from environment variables
   */
  createFromEnv(schoolName, prefix = 'DB') {
    const tables = {};
    const columns = {};
    const primaryKeys = {};

    // Load table mappings
    const studentTable = process.env[`${prefix}_TABLE_STUDENT`];
    if (studentTable) tables.student = studentTable;

    const parentTable = process.env[`${prefix}_TABLE_PARENT`];
    if (parentTable) tables.parent = parentTable;

    // Load column mappings
    const studentTableName = tables.student || 'students';
    const studentIdCol = process.env[`${prefix}_COL_STUDENT_ID`];
    if (studentIdCol) columns[`${studentTableName}.studentId`] = studentIdCol;

    return this.mergeWithDefaults({
      schoolName,
      tables,
      columns,
      primaryKeys
    });
  }

  /**
   * Create example configurations for testing
   */
  static createExampleConfigurations() {
    return {
      // School A - Standard naming
      schoolA: {
        schoolName: 'School A',
        tables: {
          student: 'students',
          parent: 'parents',
          attendance: 'attendance',
          result: 'results',
          feeBalance: 'fee_balances',
          discipline: 'discipline',
          academicCalendar: 'academic_calendar',
          ticket: 'tickets'
        },
        columns: {
          'students.studentId': 'student_id',
          'students.fullName': 'full_name',
          'students.admissionNumber': 'admission_number',
          'students.status': 'status',
          'parents.parentId': 'parent_id',
          'parents.fullName': 'full_name',
          'parents.email': 'email'
        },
        primaryKeys: {
          students: 'student_id',
          parents: 'parent_id'
        },
        valueTranslations: {
          student_status: {
            'A': 'Active',
            'I': 'Inactive',
            'G': 'Graduated',
            'W': 'Withdrawn'
          }
        }
      },

      // School B - Different naming convention
      schoolB: {
        schoolName: 'School B',
        tables: {
          student: 'learners',
          parent: 'guardians',
          attendance: 'att_records',
          result: 'exam_results',
          feeBalance: 'outstanding_fees',
          discipline: 'incidents',
          academicCalendar: 'calendar',
          ticket: 'support_tickets'
        },
        columns: {
          'learners.studentId': 'learner_id',
          'learners.fullName': 'learner_name',
          'learners.admissionNumber': 'admission_no',
          'guardians.parentId': 'guardian_id',
          'guardians.fullName': 'guardian_name',
          'att_records.attendanceId': 'record_id',
          'exam_results.resultId': 'exam_record_id'
        },
        primaryKeys: {
          learners: 'learner_id',
          guardians: 'guardian_id',
          att_records: 'record_id'
        },
        valueTranslations: {
          attendance_status: {
            'P': 'Present',
            'A': 'Absent',
            'L': 'Late',
            'E': 'Excused'
          }
        }
      },

      // School C - Legacy system naming
      schoolC: {
        schoolName: 'School C',
        tables: {
          student: 'tbl_students',
          parent: 'tbl_parents',
          attendance: 'tbl_attendance',
          result: 'tbl_results',
          feeBalance: 'tbl_fees',
          discipline: 'tbl_incidents',
          academicCalendar: 'tbl_calendar',
          ticket: 'tbl_tickets'
        },
        columns: {
          'tbl_students.studentId': 'STUD_ID',
          'tbl_students.fullName': 'NAME',
          'tbl_students.admissionNumber': 'ADMNO',
          'tbl_students.status': 'STATUS_CODE',
          'tbl_parents.parentId': 'PAR_ID',
          'tbl_parents.fullName': 'PAR_NAME'
        },
        primaryKeys: {
          tbl_students: 'STUD_ID',
          tbl_parents: 'PAR_ID'
        },
        valueTranslations: {
          student_status: {
            '01': 'Active',
            '02': 'Inactive',
            '03': 'Graduated',
            '04': 'Withdrawn'
          }
        }
      }
    };
  }
}
