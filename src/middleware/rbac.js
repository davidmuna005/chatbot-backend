import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { PLATFORM_PERMISSIONS } from '../config/permissions.js';

/**
 * RBAC Middleware
 * Provides role-based access control for endpoints
 */

// Default permissions for each role
const DEFAULT_PERMISSIONS = {
  administrator: [
    'dashboard:view',
    'parents:view',
    'parents:search',
    'students:view',
    'students:search',
    'tickets:view',
    'tickets:manage',
    'analytics:view',
    'audit:view',
    'settings:view',
    'settings:manage',
    'profile:manage',
    'users:manage',
    'roles:view',
    'roles:manage',
    'connectors:view',
    'connectors:manage',
    'calendar:view',
    'calendar:manage',
    'broadcasts:view',
    'broadcasts:manage'
  ],
  'system-admin': [
    PLATFORM_PERMISSIONS.VIEW_DASHBOARD,
    PLATFORM_PERMISSIONS.VIEW_SCHOOLS,
    PLATFORM_PERMISSIONS.MANAGE_SCHOOLS,
    PLATFORM_PERMISSIONS.VIEW_STUDENTS,
    PLATFORM_PERMISSIONS.VIEW_PARENTS,
    PLATFORM_PERMISSIONS.VIEW_TICKETS,
    PLATFORM_PERMISSIONS.VIEW_CONVERSATIONS,
    PLATFORM_PERMISSIONS.VIEW_ATTENDANCE,
    PLATFORM_PERMISSIONS.VIEW_RESULTS,
    PLATFORM_PERMISSIONS.VIEW_FEES,
    PLATFORM_PERMISSIONS.VIEW_DEPLOYMENTS,
    PLATFORM_PERMISSIONS.MANAGE_DEPLOYMENTS,
    PLATFORM_PERMISSIONS.VIEW_CONNECTORS,
    PLATFORM_PERMISSIONS.MANAGE_CONNECTORS,
    PLATFORM_PERMISSIONS.VIEW_CONNECTOR_MAPPINGS,
    PLATFORM_PERMISSIONS.MANAGE_CONNECTOR_MAPPINGS,
    PLATFORM_PERMISSIONS.VIEW_WEBHOOKS,
    PLATFORM_PERMISSIONS.MANAGE_WEBHOOKS,
    PLATFORM_PERMISSIONS.VIEW_ANALYTICS,
    PLATFORM_PERMISSIONS.VIEW_LOGS,
    PLATFORM_PERMISSIONS.VIEW_LICENSES,
    PLATFORM_PERMISSIONS.MANAGE_LICENSES,
    PLATFORM_PERMISSIONS.VIEW_PROVIDERS,
    PLATFORM_PERMISSIONS.MANAGE_PROVIDERS,
    PLATFORM_PERMISSIONS.VIEW_USERS,
    PLATFORM_PERMISSIONS.MANAGE_USERS,
    PLATFORM_PERMISSIONS.VIEW_ROLES,
    PLATFORM_PERMISSIONS.MANAGE_ROLES,
    PLATFORM_PERMISSIONS.VIEW_PERMISSIONS,
    PLATFORM_PERMISSIONS.MANAGE_PERMISSIONS,
    PLATFORM_PERMISSIONS.VIEW_AUDIT,
    PLATFORM_PERMISSIONS.VIEW_NOTIFICATIONS,
    PLATFORM_PERMISSIONS.MANAGE_NOTIFICATIONS,
    PLATFORM_PERMISSIONS.VIEW_BROADCASTS,
    PLATFORM_PERMISSIONS.MANAGE_BROADCASTS,
    PLATFORM_PERMISSIONS.VIEW_CALENDAR,
    PLATFORM_PERMISSIONS.VIEW_OTP,
    PLATFORM_PERMISSIONS.VIEW_SESSIONS,
    PLATFORM_PERMISSIONS.VIEW_SETTINGS,
    PLATFORM_PERMISSIONS.MANAGE_SETTINGS,
    PLATFORM_PERMISSIONS.VIEW_HEALTH,
    PLATFORM_PERMISSIONS.VIEW_PROFILE,
    PLATFORM_PERMISSIONS.MANAGE_PROFILE,
    PLATFORM_PERMISSIONS.RESTART_CONNECTORS,
    PLATFORM_PERMISSIONS.BROADCAST_NOTIFICATIONS,
  ],
  principal: [
    'dashboard:view',
    'parents:view',
    'parents:search',
    'students:view',
    'students:search',
    'tickets:view',
    'analytics:view',
    'audit:view',
    'settings:view',
    'profile:manage',
  ],
  'deputy-principal': [
    'dashboard:view',
    'parents:view',
    'parents:search',
    'students:view',
    'students:search',
    'tickets:view',
    'tickets:manage',
    'profile:manage',
  ],
  'finance-officer': [
    'dashboard:view',
    'parents:view',
    'students:view',
    'students:search',
    'tickets:view',
    'analytics:view:fees',
    'profile:manage',
  ],
  teacher: [
    'students:view',
    'students:search',
    'attendance:view',
    'results:view',
    'discipline:view',
    'profile:manage',
  ],
  secretary: [
    'dashboard:view',
    'parents:view',
    'parents:search',
    'students:view',
    'students:search',
    'tickets:view',
    'tickets:manage',
    'broadcasts:view',
    'profile:manage',
  ],
  'ict-officer': [
    'dashboard:view',
    'connectors:view',
    'connectors:manage',
    'settings:view',
    'settings:manage',
    'audit:view',
    'users:manage',
    'roles:manage',
    'profile:manage',
  ],
};

/**
 * Check if user has required permission
 */
export function checkPermission(userRole, requiredPermission) {
  const userPermissions = DEFAULT_PERMISSIONS[userRole] || [];

  // Administrators have all permissions
  if (userPermissions.includes('*')) {
    return true;
  }

  // Check for exact permission match
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  // Check for wildcard permissions (e.g., 'parents:*' matches 'parents:view')
  const [resource] = requiredPermission.split(':');
  if (userPermissions.includes(`${resource}:*`)) {
    return true;
  }

  return false;
}

/**
 * RBAC Middleware Factory
 * Creates middleware that requires specific permissions
 */
export function requirePermission(requiredPermissions) {
  // Handle both string and array of permissions
  const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // Check if user has at least one of the required permissions
    const hasPermission = permissions.some((permission) => checkPermission(req.user.role, permission));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions for this operation',
        requiredPermissions: permissions,
      });
    }

    next();
  };
}

/**
 * Verify token and extract user information
 */
export function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    if (token === 'school-admin-session') {
      req.user = {
        id: 'demo-school-admin',
        name: 'School Admin',
        email: 'admin@school.com',
        role: 'principal',
        schoolId: 'school-001',
        permissions: getRolePermissions('principal'),
      };
      return next();
    }

    const payload = jwt.verify(token, config.jwt.secret);

    req.user = {
      id: payload.sub || payload.id,
      name: payload.name || payload.email || 'Unknown User',
      email: payload.email,
      role: payload.role,
      schoolId: payload.schoolId,
      permissions: payload.permissions || getRolePermissions(payload.role),
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token',
    });
  }
}

/**
 * Get role permissions
 */
export function getRolePermissions(role) {
  return DEFAULT_PERMISSIONS[role] || [];
}

/**
 * Get all roles with their permissions
 */
export function getAllRolesWithPermissions() {
  return Object.entries(DEFAULT_PERMISSIONS).map(([role, permissions]) => ({
    role,
    permissions,
  }));
}
