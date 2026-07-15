import { ServiceResult } from '../../services/serviceResult.js';

export class ServiceLayerAdapter {
  constructor({ services = {}, logger } = {}) {
    this.services = services;
    this.logger = logger;
  }

  async execute(action, options = {}) {
    try {
      switch (action) {
        case 'validateNationalId':
          return this._validateNationalId(options);
        case 'verifyOtp':
          return this._verifyOtp(options);
        case 'selectStudent':
          return this._selectStudent(options);
        case 'getFeeBalance':
          return this.services.feeBalanceService?.getFeeBalance?.({ context: options.context }) ?? this._unsupported(action);
        case 'getAttendance':
          return this.services.attendanceService?.getAttendance?.({ context: options.context }) ?? this._unsupported(action);
        case 'getResults':
          return this.services.resultsService?.getResults?.({ context: options.context }) ?? this._unsupported(action);
        case 'getDiscipline':
          return this.services.disciplineService?.getDiscipline?.({ context: options.context }) ?? this._unsupported(action);
        case 'getSchoolCalendar':
          return ServiceResult.failure('not-implemented', {}, null, 'School calendar service is not available', 'NOT_IMPLEMENTED');
        case 'getAnnouncements':
          return ServiceResult.failure('not-implemented', {}, null, 'Announcements service is not available', 'NOT_IMPLEMENTED');
        case 'createSupportTicket':
          return this._createSupportTicket(options);
        case 'updatePhoneNumber':
          return this._updatePhoneNumber(options);
        default:
          return this._unsupported(action);
      }
    } catch (error) {
      this.logger?.error?.('Service layer adapter error', { action, error: error.message });
      return ServiceResult.fromError(error);
    }
  }

  async _validateNationalId({ nationalId, context }) {
    if (!nationalId) {
      return ServiceResult.failure('validation-failed', {}, null, 'National ID is required', 'VALIDATION_FAILED');
    }

    const authenticationService = this.services.authenticationService;
    if (!authenticationService?.requestOtp) {
      return this._unsupported('validateNationalId');
    }

    const result = await authenticationService.requestOtp({ nationalId });
    if (!result.success) {
      return result;
    }

    if (result.data?.parentId) {
      context.parentId = result.data.parentId;
      context.variables = {
        ...context.variables,
        nationalId,
        parentId: result.data.parentId
      };
    }

    return result;
  }

  async _verifyOtp({ otp, context }) {
    if (!otp) {
      return ServiceResult.failure('validation-failed', {}, null, 'OTP code is required', 'VALIDATION_FAILED');
    }

    const authenticationService = this.services.authenticationService;
    if (!authenticationService?.authenticate) {
      return this._unsupported('verifyOtp');
    }

    const nationalId = context.variables?.nationalId;
    const parentId = context.parentId;
    const result = await authenticationService.authenticate({ nationalId, otpCode: otp, parentId });

    if (result.success && result.data?.session) {
      context.parentId = result.data?.parent?.id || result.data?.session?.parentId || parentId;
      context.authenticated = true;
      context.variables = {
        ...context.variables,
        authenticatedAt: new Date().toISOString()
      };
    }

    return result;
  }

  async _selectStudent({ admissionNumber, context }) {
    if (!admissionNumber) {
      return ServiceResult.failure('validation-failed', {}, null, 'Admission number is required', 'VALIDATION_FAILED');
    }

    const studentService = this.services.studentService;
    if (!studentService?.getStudent) {
      return this._unsupported('selectStudent');
    }

    const result = await studentService.getStudent({ admissionNumber, parentId: context.parentId });
    if (result.success && result.data) {
      context.selectedStudent = result.data;
    }

    return result;
  }

  async _createSupportTicket({ context, message }) {
    const ticketService = this.services.ticketService;
    if (!ticketService?.create) {
      return this._unsupported('createSupportTicket');
    }

    const payload = {
      parentId: context.parentId,
      student: context.selectedStudent,
      message: message || 'Support request from WhatsApp'
    };
    return ticketService.create(payload);
  }

  async _updatePhoneNumber({ context, phoneNumber }) {
    const parentService = this.services.parentService;
    if (!parentService?.createPhoneUpdateRequest) {
      return this._unsupported('updatePhoneNumber');
    }

    return parentService.createPhoneUpdateRequest({ parentId: context.parentId, phone: phoneNumber });
  }

  _unsupported(action) {
    return ServiceResult.failure('unsupported-service', {}, null, `Service action '${action}' is not implemented`, 'UNSUPPORTED_SERVICE');
  }
}
