import { AuthenticationService } from '../services/index.js';
import { ServiceResult } from '../services/serviceResult.js';

export class AuthController {
  constructor(dependencies = {}) {
    this.authService = dependencies.authService || new AuthenticationService(dependencies);
  }

  async login(req, res, next) {
    try {
      const result = await this.authService.authenticate?.(req.body) ?? await this.authService.login?.(req.body) ?? ServiceResult.failure('Authentication endpoint is not implemented', {}, null, 'Authentication endpoint is not implemented', 'NOT_IMPLEMENTED');
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const result = await this.authService.logout?.(req.body) ?? ServiceResult.failure('Logout endpoint is not implemented', {}, null, 'Logout endpoint is not implemented', 'NOT_IMPLEMENTED');
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const result = await this.authService.refresh?.(req.body) ?? ServiceResult.failure('Refresh endpoint is not implemented', {}, null, 'Refresh endpoint is not implemented', 'NOT_IMPLEMENTED');
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }
}
