/**
 * RBAC Middleware
 * Provides role-based access control for endpoints
 */

// Default permissions for each role
const DEFAULT_PERMISSIONS = {
  administrator: ['*'], // Full access
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
  const [resource, action] = requiredPermission.split(':');
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
    // For now, this is a placeholder
    // In production, verify JWT token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    // Attach user to request (in production, decode JWT)
    req.user = {
      id: 'user-123',
      name: 'Test User',
      email: 'user@school.com',
      role: 'administrator', // This would be decoded from token
      schoolId: 'school-123',
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token',
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
