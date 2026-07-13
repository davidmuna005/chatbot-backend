import { PolicyResult } from './policyResult.js';

export class AuthorizationPolicy {
  evaluate({ user, permission, action, resource } = {}) {
    if (!user) {
      return PolicyResult.unauthorized('user-not-provided');
    }

    if (!permission && !action && !resource) {
      return PolicyResult.unauthorized('permission-not-provided');
    }

    const rolePermissions = Array.isArray(user.permissions) ? user.permissions : [];
    const hasPermission = rolePermissions.some((entry) => {
      const permissionSlug = typeof entry === 'string' ? entry : entry?.slug;
      const permissionName = typeof entry === 'string' ? entry : entry?.name;
      return permissionSlug === permission || permissionName === permission;
    });

    if (!hasPermission) {
      return PolicyResult.unauthorized('permission-denied');
    }

    return PolicyResult.authorized({ resource, action, permission });
  }
}
