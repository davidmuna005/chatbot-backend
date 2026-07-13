import { ServiceResult } from '../serviceResult.js';

export class ConfigurationService {
  constructor({ configurationRepository, logger } = {}) {
    this.configurationRepository = configurationRepository;
    this.logger = logger;
  }

  async get(key) {
    try {
      const result = await this.configurationRepository?.get?.({ key });
      return ServiceResult.success(result, {}, null, 'Configuration retrieved', 'CONFIGURATION_FOUND');
    } catch (error) {
      return ServiceResult.fromError(error);
    }
  }

  async update(payload = {}) {
    try {
      const result = await this.configurationRepository?.update?.(payload);
      return ServiceResult.success(result, {}, null, 'Configuration updated', 'CONFIGURATION_UPDATED');
    } catch (error) {
      return ServiceResult.fromError(error);
    }
  }
}
