/**
 * Canonical Data Models
 * 
 * These are standardized domain objects that all connectors must return.
 * They provide a unified interface regardless of the underlying database schema.
 */

export class CanonicalStudent {
  constructor(data = {}) {
    this.studentId = data.studentId || null;
    this.fullName = data.fullName || '';
    this.admissionNumber = data.admissionNumber || '';
    this.dateOfBirth = data.dateOfBirth || null;
    this.gender = data.gender || null; // 'M', 'F', or null
    this.currentClass = data.currentClass || '';
    this.stream = data.stream || '';
    this.status = data.status || 'Active'; // Active, Inactive, Graduated, Withdrawn
    this.enrollmentDate = data.enrollmentDate || null;
    this.parentId = data.parentId || null;
    this.guardianName = data.guardianName || '';
    this.guardianPhone = data.guardianPhone || '';
    this.guardianEmail = data.guardianEmail || '';
    this.metadata = data.metadata || {};
  }

  validate() {
    if (!this.studentId) throw new Error('Student ID is required');
    if (!this.fullName) throw new Error('Full name is required');
    return true;
  }
}

export class CanonicalParent {
  constructor(data = {}) {
    this.parentId = data.parentId || null;
    this.fullName = data.fullName || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.relationship = data.relationship || ''; // Father, Mother, Guardian
    this.gender = data.gender || null;
    this.occupation = data.occupation || '';
    this.studentIds = data.studentIds || [];
    this.status = data.status || 'Active';
    this.metadata = data.metadata || {};
  }

  validate() {
    if (!this.parentId) throw new Error('Parent ID is required');
    if (!this.fullName) throw new Error('Full name is required');
    return true;
  }
}

export class CanonicalAttendance {
  constructor(data = {}) {
    this.attendanceId = data.attendanceId || null;
    this.studentId = data.studentId || null;
    this.date = data.date || null;
    this.status = data.status || 'Present'; // Present, Absent, Late, Excused
    this.remarks = data.remarks || '';
    this.recordedBy = data.recordedBy || '';
    this.metadata = data.metadata || {};
  }

  validate() {
    if (!this.studentId) throw new Error('Student ID is required');
    if (!this.date) throw new Error('Date is required');
    return true;
  }
}

export class CanonicalResult {
  constructor(data = {}) {
    this.resultId = data.resultId || null;
    this.studentId = data.studentId || null;
    this.subject = data.subject || '';
    this.term = data.term || ''; // Term 1, Term 2, Term 3, Annual
    this.academicYear = data.academicYear || '';
    this.score = data.score || 0;
    this.grade = data.grade || ''; // A, B, C, D, E, F
    this.gradePoints = data.gradePoints || 0;
    this.remarks = data.remarks || '';
    this.teacherName = data.teacherName || '';
    this.metadata = data.metadata || {};
  }

  validate() {
    if (!this.studentId) throw new Error('Student ID is required');
    if (!this.subject) throw new Error('Subject is required');
    return true;
  }
}

export class CanonicalFeeBalance {
  constructor(data = {}) {
    this.feeBalanceId = data.feeBalanceId || null;
    this.studentId = data.studentId || null;
    this.term = data.term || '';
    this.academicYear = data.academicYear || '';
    this.totalAmount = data.totalAmount || 0;
    this.paidAmount = data.paidAmount || 0;
    this.balanceAmount = data.balanceAmount || 0;
    this.dueDate = data.dueDate || null;
    this.status = data.status || 'Pending'; // Pending, Partial, Paid, Overdue
    this.metadata = data.metadata || {};
  }

  validate() {
    if (!this.studentId) throw new Error('Student ID is required');
    this.balanceAmount = this.totalAmount - this.paidAmount;
    return true;
  }
}

export class CanonicalDiscipline {
  constructor(data = {}) {
    this.disciplineId = data.disciplineId || null;
    this.studentId = data.studentId || null;
    this.incidentDate = data.incidentDate || null;
    this.incidentType = data.incidentType || ''; // Warning, Suspension, Expulsion, etc.
    this.description = data.description || '';
    this.action = data.action || '';
    this.actionDate = data.actionDate || null;
    this.reportedBy = data.reportedBy || '';
    this.status = data.status || 'Open'; // Open, Resolved, Appealed
    this.metadata = data.metadata || {};
  }

  validate() {
    if (!this.studentId) throw new Error('Student ID is required');
    if (!this.incidentDate) throw new Error('Incident date is required');
    return true;
  }
}

export class CanonicalAcademicCalendar {
  constructor(data = {}) {
    this.calendarId = data.calendarId || null;
    this.academicYear = data.academicYear || '';
    this.term = data.term || '';
    this.startDate = data.startDate || null;
    this.endDate = data.endDate || null;
    this.examStartDate = data.examStartDate || null;
    this.examEndDate = data.examEndDate || null;
    this.resultPublishDate = data.resultPublishDate || null;
    this.status = data.status || 'Active'; // Active, Completed, Planned
    this.metadata = data.metadata || {};
  }

  validate() {
    if (!this.academicYear) throw new Error('Academic year is required');
    if (!this.term) throw new Error('Term is required');
    return true;
  }
}

export class CanonicalTicket {
  constructor(data = {}) {
    this.ticketId = data.ticketId || null;
    this.studentId = data.studentId || null;
    this.subject = data.subject || '';
    this.description = data.description || '';
    this.status = data.status || 'Open'; // Open, InProgress, Closed, Reopened
    this.priority = data.priority || 'Normal'; // Low, Normal, High, Urgent
    this.category = data.category || '';
    this.createdDate = data.createdDate || null;
    this.updatedDate = data.updatedDate || null;
    this.closedDate = data.closedDate || null;
    this.assignedTo = data.assignedTo || '';
    this.metadata = data.metadata || {};
  }

  validate() {
    if (!this.ticketId) throw new Error('Ticket ID is required');
    if (!this.studentId) throw new Error('Student ID is required');
    return true;
  }
}

export class CanonicalSession {
  constructor(data = {}) {
    this.sessionId = data.sessionId || null;
    this.parentId = data.parentId || null;
    this.tokenHash = data.tokenHash || '';
    this.ipAddress = data.ipAddress || '';
    this.userAgent = data.userAgent || '';
    this.status = data.status || 'Active'; // Active, Expired, Revoked
    this.createdAt = data.createdAt || null;
    this.expiresAt = data.expiresAt || null;
    this.metadata = data.metadata || {};
  }

  validate() {
    if (!this.sessionId) throw new Error('Session ID is required');
    return true;
  }
}

export class CanonicalOTP {
  constructor(data = {}) {
    this.otpId = data.otpId || null;
    this.identifier = data.identifier || ''; // Phone or Email
    this.code = data.code || '';
    this.status = data.status || 'Pending'; // Pending, Verified, Expired, Failed
    this.attempts = data.attempts || 0;
    this.maxAttempts = data.maxAttempts || 3;
    this.createdAt = data.createdAt || null;
    this.expiresAt = data.expiresAt || null;
    this.verifiedAt = data.verifiedAt || null;
    this.metadata = data.metadata || {};
  }

  validate() {
    if (!this.otpId) throw new Error('OTP ID is required');
    if (!this.identifier) throw new Error('Identifier (phone/email) is required');
    return true;
  }
}
