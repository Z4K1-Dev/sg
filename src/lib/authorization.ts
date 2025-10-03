/**
 * Checks if a user has a specific role
 * @param session - The user session
 * @param requiredRole - The role required to access the resource
 * @returns boolean indicating if the user has the required role
 */
export function hasRole(session: any, requiredRole: string): boolean {
  if (!session?.user) return false;
  
  const userRole = session.user.role as string;
  
  // Admin has access to everything
  if (userRole === 'ADMIN') return true;
  
  // Check for exact role match or higher privileges
  if (requiredRole === 'ADMIN') return userRole === 'ADMIN';
  if (requiredRole === 'OPERATOR') return userRole === 'ADMIN' || userRole === 'OPERATOR';
  if (requiredRole === 'USER') return userRole === 'ADMIN' || userRole === 'OPERATOR' || userRole === 'USER';
  
  return false;
}

/**
 * Checks if a user has a specific permission
 * @param session - The user session
 * @param permission - The action permission to check (e.g. 'read', 'write', 'delete')
 * @param resource - The resource type (e.g. 'user', 'post', 'report')
 * @returns boolean indicating if the user has the required permission
 */
export function hasPermission(
  session: any, 
  permission: string, 
  resource: string
): boolean {
  if (!session?.user) return false;
  
  const userRole = session.user.role as string;
  
  // Admin has all permissions
  if (userRole === 'ADMIN') return true;
  
  // Define role-based permissions
  const rolePermissions: Record<string, Record<string, string[]>> = {
    ADMIN: {
      user: ['read', 'write', 'update', 'delete'],
      post: ['read', 'write', 'update', 'delete'],
      report: ['read', 'write', 'update', 'delete'],
      setting: ['read', 'write', 'update', 'delete'],
    },
    OPERATOR: {
      user: ['read'],
      post: ['read', 'write', 'update'],
      report: ['read', 'write', 'update'],
      setting: ['read'],
    },
    USER: {
      user: ['read'],
      post: ['read'],
      report: ['read', 'write'],
      setting: ['read'],
    },
  };

  const permissions = rolePermissions[userRole] || {};
  const resourcePermissions = permissions[resource] || [];
  
  return resourcePermissions.includes(permission);
}

/**
 * Checks if a user can access a specific resource
 * @param session - The user session
 * @param action - The action to perform (e.g. 'view', 'edit', 'delete')
 * @param resource - The resource type (e.g. 'profile', 'post', 'report')
 * @param userId - Optional: The ID of the user whose resource is being accessed (for user-specific permissions)
 * @returns boolean indicating if the user has access
 */
export function canAccess(
  session: any,
  action: string,
  resource: string,
  userId?: string
): boolean {
  if (!session?.user) return false;

  // If it's a self-access scenario
  if (resource === 'profile' && userId && session.user.id === userId) {
    return action === 'view' || action === 'edit';
  }

  // Use the permission checker
  return hasPermission(session, action, resource);
}