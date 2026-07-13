import { ServiceResult } from '../serviceResult.js';

export class FeeBalanceService {
  constructor({ feeRepository, logger } = {}) {
    this.feeRepository = feeRepository;
    this.logger = logger;
  }

  async getFeeBalance(payload = {}) {
    try {
      this.logger?.info?.('Service started', { service: 'FeeBalanceService', action: 'getFeeBalance' });
      const balance = await this.feeRepository?.getFeeBalance?.(payload);
      const outstanding = Number(balance?.outstanding ?? 0);
      const data = {
        ...balance,
        outstandingBalance: outstanding
      };
      this.logger?.info?.('Service completed', { service: 'FeeBalanceService', action: 'getFeeBalance' });
      return ServiceResult.success(data, {}, null, 'Fee balance retrieved successfully', 'FEE_BALANCE_FOUND');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'FeeBalanceService', action: 'getFeeBalance', error: error.message });
      return ServiceResult.fromError(error);
    }
  }
}
