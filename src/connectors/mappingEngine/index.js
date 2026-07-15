/**
 * Schema Mapping Engine
 * 
 * Translates school-specific database schemas into canonical application models.
 * Each school has its own configuration that maps their columns to our standard model.
 */

export class SchemaMappingEngine {
  constructor(mappingConfig = {}, logger) {
    this.config = mappingConfig;
    this.logger = logger;
    this.tableMappings = mappingConfig.tables || {};
    this.columnMappings = mappingConfig.columns || {};
    this.valueTranslations = mappingConfig.valueTranslations || {};
    this.primaryKeys = mappingConfig.primaryKeys || {};
    this.dateFormats = mappingConfig.dateFormats || {};
    this.booleanFormats = mappingConfig.booleanFormats || {};
  }

  /**
   * Translate an external table name to internal canonical name
   */
  getTableName(canonicalName) {
    return this.tableMappings[canonicalName] || canonicalName;
  }

  /**
   * Translate an internal canonical column name to the school's actual column name
   */
  getColumnName(tableName, canonicalColumnName) {
    const key = `${tableName}.${canonicalColumnName}`;
    return this.columnMappings[key] || canonicalColumnName;
  }

  /**
   * Get primary key for a table
   */
  getPrimaryKey(tableName) {
    return this.primaryKeys[tableName] || 'id';
  }

  /**
   * Translate a value using configured translations
   * Example: 'M' => 'Male', 'F' => 'Female'
   */
  translateValue(field, value) {
    const translations = this.valueTranslations[field];
    if (!translations || value === null || value === undefined) {
      return value;
    }
    return translations[value] !== undefined ? translations[value] : value;
  }

  /**
   * Normalize a date value
   */
  normalizeDate(value, format = 'ISO') {
    if (!value) return null;

    try {
      if (value instanceof Date) {
        return value.toISOString();
      }

      if (typeof value === 'string') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          this.logger?.warn?.('Invalid date format', { value, format });
          return null;
        }
        return date.toISOString();
      }

      if (typeof value === 'number') {
        return new Date(value).toISOString();
      }

      return null;
    } catch (error) {
      this.logger?.error?.('Date normalization failed', { value, error: error.message });
      return null;
    }
  }

  /**
   * Normalize boolean value
   */
  normalizeBoolean(value) {
    if (value === null || value === undefined) return null;

    if (typeof value === 'boolean') return value;

    if (typeof value === 'number') return value !== 0;

    if (typeof value === 'string') {
      const normalized = value.toLowerCase().trim();
      return ['true', 'yes', '1', 'y', 'active', 'enabled'].includes(normalized);
    }

    return Boolean(value);
  }

  /**
   * Normalize gender value
   */
  normalizeGender(value) {
    if (!value) return null;

    const normalized = String(value).charAt(0).toUpperCase();
    return ['M', 'F', 'O'].includes(normalized) ? normalized : null;
  }

  /**
   * Normalize status value
   */
  normalizeStatus(value, statusType = 'student') {
    if (!value) return 'Unknown';

    const translations = this.valueTranslations[`${statusType}_status`];
    if (translations) {
      return translations[value] || value;
    }

    return value;
  }

  /**
   * Normalize class/grade name
   */
  normalizeClass(value) {
    if (!value) return '';
    return String(value).trim().toUpperCase();
  }

  /**
   * Map external row to canonical student model
   */
  mapToStudent(externalRow) {
    if (!externalRow) return null;

    // Try to get values using column mappings first, then fall back to common names
    const getField = (row, columnNames) => {
      for (const name of columnNames) {
        if (row[name] !== undefined && row[name] !== null) {
          return row[name];
        }
      }
      return null;
    };

    const studentTable = this.getTableName('student') || 'students';

    return {
      studentId: getField(externalRow, [
        this.getColumnName(studentTable, 'studentId'),
        'student_id', 'studentId', 'learner_id', 'STUD_ID', 'cust_student_id'
      ]),
      fullName: getField(externalRow, [
        this.getColumnName(studentTable, 'fullName'),
        'full_name', 'student_name', 'name', 'learner_name', 'NAME', 'cust_name'
      ]),
      admissionNumber: getField(externalRow, [
        this.getColumnName(studentTable, 'admissionNumber'),
        'admission_number', 'adm_no', 'admissionNumber', 'admission_no', 'ADMNO', 'cust_admission_no'
      ]),
      dateOfBirth: this.normalizeDate(getField(externalRow, [
        this.getColumnName(studentTable, 'dateOfBirth'),
        'date_of_birth', 'dob'
      ])),
      gender: this.normalizeGender(getField(externalRow, [
        this.getColumnName(studentTable, 'gender'),
        'gender', 'sex'
      ])),
      currentClass: this.normalizeClass(getField(externalRow, [
        this.getColumnName(studentTable, 'currentClass'),
        'class', 'form', 'grade'
      ])),
      stream: (getField(externalRow, [
        this.getColumnName(studentTable, 'stream'),
        'stream'
      ]) || '').toString().trim(),
      status: this.normalizeStatus(getField(externalRow, [
        this.getColumnName(studentTable, 'status'),
        'status', 'STATUS_CODE'
      ]) || 'Active', 'student'),
      enrollmentDate: this.normalizeDate(getField(externalRow, [
        this.getColumnName(studentTable, 'enrollmentDate'),
        'enrollment_date', 'date_enrolled'
      ])),
      parentId: getField(externalRow, [
        this.getColumnName(studentTable, 'parentId'),
        'parent_id', 'guardian_id'
      ]),
      guardianName: getField(externalRow, [
        this.getColumnName(studentTable, 'guardianName'),
        'guardian_name', 'parent_name'
      ]) || '',
      guardianPhone: getField(externalRow, [
        this.getColumnName(studentTable, 'guardianPhone'),
        'guardian_phone', 'parent_phone'
      ]) || '',
      guardianEmail: getField(externalRow, [
        this.getColumnName(studentTable, 'guardianEmail'),
        'guardian_email', 'parent_email'
      ]) || '',
      metadata: {
        sourceSystem: this.config.schoolName || 'Unknown',
        lastSyncedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Map external row to canonical parent model
   */
  mapToParent(externalRow) {
    if (!externalRow) return null;

    return {
      parentId: externalRow.parent_id || externalRow.id,
      fullName: externalRow.full_name || externalRow.name || externalRow.parent_name,
      email: externalRow.email || externalRow.email_address || '',
      phone: externalRow.phone || externalRow.phone_number || '',
      relationship: this.translateValue('relationship', externalRow.relationship || ''),
      gender: this.normalizeGender(externalRow.gender || externalRow.sex),
      occupation: externalRow.occupation || '',
      studentIds: externalRow.student_ids ? (Array.isArray(externalRow.student_ids) ? externalRow.student_ids : [externalRow.student_ids]) : [],
      status: this.normalizeStatus(externalRow.status || 'Active', 'parent'),
      metadata: {
        sourceSystem: this.config.schoolName || 'Unknown',
        lastSyncedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Map external row to canonical attendance model
   */
  mapToAttendance(externalRow) {
    if (!externalRow) return null;

    return {
      attendanceId: externalRow.attendance_id || externalRow.id,
      studentId: externalRow.student_id || externalRow.learner_id,
      date: this.normalizeDate(externalRow.date || externalRow.attendance_date),
      status: this.translateValue('attendance_status', externalRow.status || 'Present'),
      remarks: externalRow.remarks || externalRow.notes || '',
      recordedBy: externalRow.recorded_by || externalRow.teacher_name || '',
      metadata: {
        sourceSystem: this.config.schoolName || 'Unknown',
        lastSyncedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Map external row to canonical result model
   */
  mapToResult(externalRow) {
    if (!externalRow) return null;

    return {
      resultId: externalRow.result_id || externalRow.id,
      studentId: externalRow.student_id || externalRow.learner_id,
      subject: (externalRow.subject || externalRow.course_name || '').toString().trim(),
      term: this.translateValue('term', externalRow.term || externalRow.exam_type),
      academicYear: (externalRow.academic_year || externalRow.year || '').toString().trim(),
      score: parseFloat(externalRow.score || externalRow.marks || 0),
      grade: (externalRow.grade || externalRow.grade_letter || '').toString().toUpperCase(),
      gradePoints: parseFloat(externalRow.grade_points || externalRow.points || 0),
      remarks: externalRow.remarks || externalRow.comments || '',
      teacherName: externalRow.teacher_name || externalRow.teacher || '',
      metadata: {
        sourceSystem: this.config.schoolName || 'Unknown',
        lastSyncedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Map external row to canonical fee balance model
   */
  mapToFeeBalance(externalRow) {
    if (!externalRow) return null;

    const totalAmount = parseFloat(externalRow.total_amount || externalRow.total_fees || 0);
    const paidAmount = parseFloat(externalRow.paid_amount || externalRow.amount_paid || 0);
    const balanceAmount = totalAmount - paidAmount;

    return {
      feeBalanceId: externalRow.fee_balance_id || externalRow.id,
      studentId: externalRow.student_id || externalRow.learner_id,
      term: this.translateValue('term', externalRow.term || ''),
      academicYear: (externalRow.academic_year || externalRow.year || '').toString().trim(),
      totalAmount,
      paidAmount,
      balanceAmount,
      dueDate: this.normalizeDate(externalRow.due_date || externalRow.payment_due_date),
      status: this.normalizeStatus(externalRow.status || 'Pending', 'fee'),
      metadata: {
        sourceSystem: this.config.schoolName || 'Unknown',
        lastSyncedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Map external row to canonical discipline model
   */
  mapToDiscipline(externalRow) {
    if (!externalRow) return null;

    return {
      disciplineId: externalRow.discipline_id || externalRow.incident_id || externalRow.id,
      studentId: externalRow.student_id || externalRow.learner_id,
      incidentDate: this.normalizeDate(externalRow.incident_date || externalRow.date),
      incidentType: this.translateValue('incident_type', externalRow.incident_type || externalRow.type),
      description: externalRow.description || externalRow.details || '',
      action: this.translateValue('action_type', externalRow.action || externalRow.action_taken || ''),
      actionDate: this.normalizeDate(externalRow.action_date || externalRow.date_actioned),
      reportedBy: externalRow.reported_by || externalRow.staff_name || '',
      status: this.normalizeStatus(externalRow.status || 'Open', 'discipline'),
      metadata: {
        sourceSystem: this.config.schoolName || 'Unknown',
        lastSyncedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Map external row to canonical academic calendar model
   */
  mapToAcademicCalendar(externalRow) {
    if (!externalRow) return null;

    return {
      calendarId: externalRow.calendar_id || externalRow.id,
      academicYear: (externalRow.academic_year || externalRow.year || '').toString().trim(),
      term: this.translateValue('term', externalRow.term || externalRow.term_name),
      startDate: this.normalizeDate(externalRow.start_date || externalRow.opening_date),
      endDate: this.normalizeDate(externalRow.end_date || externalRow.closing_date),
      examStartDate: this.normalizeDate(externalRow.exam_start_date),
      examEndDate: this.normalizeDate(externalRow.exam_end_date),
      resultPublishDate: this.normalizeDate(externalRow.result_publish_date),
      status: this.normalizeStatus(externalRow.status || 'Active', 'calendar'),
      metadata: {
        sourceSystem: this.config.schoolName || 'Unknown',
        lastSyncedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Map external row to canonical ticket model
   */
  mapToTicket(externalRow) {
    if (!externalRow) return null;

    return {
      ticketId: externalRow.ticket_id || externalRow.id,
      studentId: externalRow.student_id || externalRow.learner_id,
      subject: externalRow.subject || externalRow.title || '',
      description: externalRow.description || externalRow.issue || '',
      status: this.normalizeStatus(externalRow.status || 'Open', 'ticket'),
      priority: this.translateValue('priority', externalRow.priority || 'Normal'),
      category: externalRow.category || externalRow.ticket_type || '',
      createdDate: this.normalizeDate(externalRow.created_date || externalRow.created_at),
      updatedDate: this.normalizeDate(externalRow.updated_date || externalRow.updated_at),
      closedDate: this.normalizeDate(externalRow.closed_date || externalRow.closed_at),
      assignedTo: externalRow.assigned_to || externalRow.assigned_staff || '',
      metadata: {
        sourceSystem: this.config.schoolName || 'Unknown',
        lastSyncedAt: new Date().toISOString()
      }
    };
  }
}
