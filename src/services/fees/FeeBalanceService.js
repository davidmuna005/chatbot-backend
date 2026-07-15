import { ServiceResult } from '../serviceResult.js';

export class FeeBalanceService {
  constructor({ feeRepository, studentRepository, authorizationPolicy, logger } = {}) {
    this.feeRepository = feeRepository;
    this.studentRepository = studentRepository;
    this.authorizationPolicy = authorizationPolicy;
    this.logger = logger;
  }

  async getFeeBalance({ context, admissionNumber, studentId } = {}) {
    try {
      this.logger?.info?.('Service started', { service: 'FeeBalanceService', action: 'getFeeBalance' });

      if (!context?.authenticated) {
        return ServiceResult.accessDenied('Parent must be authenticated', {}, null, 'Authentication required to access fee balance', 'UNAUTHORIZED_PARENT');
      }

      const student = context?.selectedStudent
        || (admissionNumber ? await this.studentRepository?.findByAdmissionNumber?.(admissionNumber) : null)
        || (studentId ? await this.studentRepository?.findByStudentId?.(studentId) : null);

      if (!student) {
        return ServiceResult.notFound('Student not found', {}, null, 'Student not found', 'STUDENT_NOT_FOUND');
      }

      if (String(student.status).toLowerCase() !== 'active') {
        return ServiceResult.accessDenied('Only current students may access fee balances', {}, null, 'Former students are not eligible for fee balance lookup', 'FORMER_STUDENT');
      }

      const authDecision = this.authorizationPolicy?.evaluate?.({ user: { permissions: ['view-fee-balance'] }, permission: 'view-fee-balance' });
      if (!authDecision?.allowed) {
        return ServiceResult.accessDenied(authDecision?.reason ?? 'fee-balance-access-denied', {}, authDecision);
      }

      const balance = await this.feeRepository?.getFeeBalance?.({ studentId: student.id, admissionNumber: student.admissionNumber, parentId: context.parentId });
      const outstandingBalance = Number(balance?.outstanding ?? balance?.outstandingBalance ?? 0);
      const normalized = {
        student: {
          id: student.id,
          studentId: student.studentId,
          admissionNumber: student.admissionNumber,
          status: student.status
        },
        outstandingBalance,
        currency: balance?.currency ?? 'USD',
        charges: Array.isArray(balance?.charges) ? balance.charges : balance?.charges ? [balance.charges] : [],
        payments: Array.isArray(balance?.payments) ? balance.payments : balance?.payments ? [balance.payments] : []
      };

      this.logger?.info?.('Service completed', { service: 'FeeBalanceService', action: 'getFeeBalance' });
      return ServiceResult.success(normalized, {}, authDecision, 'Fee balance retrieved successfully', 'FEE_BALANCE_FOUND');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'FeeBalanceService', action: 'getFeeBalance', error: error.message });
      return ServiceResult.fromError(error);
    }
  }
}
