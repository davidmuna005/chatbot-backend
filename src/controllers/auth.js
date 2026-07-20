import jwt from 'jsonwebtoken';
import { AuthenticationService } from '../services/index.js';
import { ServiceResult } from '../services/serviceResult.js';
import { config } from '../config/index.js';
import { getRolePermissions } from '../middleware/rbac.js';

const DEMO_ADMINISTRATIVE_ROLES = {
  principal: {
    role: 'principal',
    name: 'Principal',
    email: 'principal@school.com',
    schoolId: 'school-001',
    password: 'principal2024'
  },
  'academic officer': {
    role: 'academic officer',
    name: 'Academic Officer',
    email: 'academic.officer@school.com',
    schoolId: 'school-001',
    password: 'academic2024'
  },
  'it manager': {
    role: 'it manager',
    name: 'IT Manager',
    email: 'it.manager@school.com',
    schoolId: 'school-001',
    password: 'itmanager2024'
  },
  'support staff': {
    role: 'support staff',
    name: 'Support Staff',
    email: 'support.staff@school.com',
    schoolId: 'school-001',
    password: 'support2024'
  }
};

export class AuthController {
  constructor(dependencies = {}) {
    this.authService = dependencies.authService || new AuthenticationService(dependencies);
  }

  async login(req, res, next) {
    try {
      const { role, password } = req.body;

      if (typeof role === 'string' && typeof password === 'string') {
        const normalizedRole = role.trim().toLowerCase();

        if (normalizedRole === 'system-admin') {
          const expectedPassword = config.environment.SYSTEM_ADMIN_PASSWORD;
          if (password !== expectedPassword) {
            return res.status(401).json(ServiceResult.failure('Invalid system admin credentials', {}, null, 'Invalid credentials', 'AUTH_FAILED'));
          }

          const token = jwt.sign(
            {
              role: 'system-admin',
              name: 'System Administrator',
              email: 'sysadmin@platform.com',
              permissions: getRolePermissions('system-admin')
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
          );

          return res.status(200).json(ServiceResult.success({ token, user: { id: 'system-admin', role: 'system-admin', name: 'System Administrator', email: 'sysadmin@platform.com' } }));
        }

        const roleDefinition = DEMO_ADMINISTRATIVE_ROLES[normalizedRole];
        if (roleDefinition && roleDefinition.password === password) {
          const token = jwt.sign(
            {
              role: roleDefinition.role,
              name: roleDefinition.name,
              email: roleDefinition.email,
              schoolId: roleDefinition.schoolId,
              permissions: getRolePermissions(roleDefinition.role)
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
          );

          return res.status(200).json(ServiceResult.success({ token, user: { id: `${normalizedRole}-admin`, role: roleDefinition.role, name: roleDefinition.name, email: roleDefinition.email, schoolId: roleDefinition.schoolId } }));
        }
      }

      const result = await this.authService.authenticate?.(req.body)
        ?? await this.authService.login?.(req.body)
        ?? ServiceResult.failure('Authentication endpoint is not implemented', {}, null, 'Authentication endpoint is not implemented', 'NOT_IMPLEMENTED');

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
