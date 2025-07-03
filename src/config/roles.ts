import { Role } from '@prisma/client';

import { Permission } from '@/types/rbac';

const allRoles: Record<Role, Permission[]> = {
  [Role.USER]: [
    'viewProfile',
    'updateProfile',
    'viewPosts',
    'createPost',
    'updateOwnPost',
    'deleteOwnPost',
    'createComment',
    'updateOwnComment',
    'deleteOwnComment',
    'viewNotifications',
  ],
  [Role.MODERATOR]: [
    'viewProfile',
    'updateProfile',
    'viewPosts',
    'createPost',
    'updateOwnPost',
    'deleteOwnPost',
    'createComment',
    'updateOwnComment',
    'deleteOwnComment',
    'viewNotifications',
    'moderatePosts',
    'moderateComments',
    'viewAllUsers',
  ],
  [Role.ADMIN]: [
    'viewProfile',
    'updateProfile',
    'viewPosts',
    'createPost',
    'updateOwnPost',
    'deleteOwnPost',
    'createComment',
    'updateOwnComment',
    'deleteOwnComment',
    'viewNotifications',
    'moderatePosts',
    'moderateComments',
    'viewAllUsers',
    'manageUsers',
    'manageRoles',
    'viewSystemAnalytics',
    'viewAuditLogs',
  ],
};

export const roles = Object.keys(allRoles) as Role[];
export const roleRights = new Map<Role, Permission[]>(
  Object.entries(allRoles) as [Role, Permission[]][]
);

// Function to get the combined rights for a user with multiple roles
export const getUserRights = (userRoles: Role[]): Permission[] => {
  // If user is admin, return all possible permissions
  if (userRoles.includes(Role.ADMIN)) {
    return Object.values(allRoles).flat();
  }

  const rights = new Set<Permission>();
  userRoles.forEach((role) => {
    const roleRight = roleRights.get(role) ?? [];
    roleRight.forEach((right) => rights.add(right));
  });
  return Array.from(rights);
};

// Function to check if a user has a specific right
export const hasRight = (userRoles: Role[], requiredRight: Permission): boolean => {
  // Admin has all rights
  if (userRoles.includes(Role.ADMIN)) {
    return true;
  }

  const userRights = getUserRights(userRoles);
  return userRights.includes(requiredRight);
};

// Function to check if a user has all required rights
export const hasAllRights = (userRoles: Role[], requiredRights: Permission[]): boolean => {
  // Admin has all rights
  if (userRoles.includes(Role.ADMIN)) {
    return true;
  }

  const userRights = getUserRights(userRoles);
  return requiredRights.every((right) => userRights.includes(right));
};
