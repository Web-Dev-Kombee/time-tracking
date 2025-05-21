import { UserRole } from "@/types";
import { ComponentType } from "react";

// Type for defining role-based permissions
type ResourcePermissions = {
  view: UserRole[];
  create: UserRole[];
  edit: UserRole[];
  delete: UserRole[];
};

// Define interface for navigation items
export interface NavigationItem {
  href: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  children?: NavigationItem[];
  [key: string]: unknown; // Allow for additional properties
}

// Define permissions for different resources
const resourcePermissions: Record<string, ResourcePermissions> = {
  clients: {
    view: [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.ACCOUNTS,
      UserRole.SALES,
      UserRole.EMPLOYEE,
    ],
    create: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SALES],
    edit: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SALES],
    delete: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  projects: {
    view: [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.ACCOUNTS,
      UserRole.SALES,
      UserRole.EMPLOYEE,
    ],
    create: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SALES],
    edit: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SALES],
    delete: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  invoices: {
    view: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTS, UserRole.SALES],
    create: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTS],
    edit: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTS],
    delete: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  reports: {
    view: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTS],
    create: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTS],
    edit: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    delete: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  users: {
    view: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    create: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    edit: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    delete: [UserRole.SUPER_ADMIN],
  },
  timeEntries: {
    view: [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.ACCOUNTS,
      UserRole.SALES,
      UserRole.EMPLOYEE,
    ],
    create: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SALES, UserRole.EMPLOYEE],
    edit: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EMPLOYEE],
    delete: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EMPLOYEE],
  },
  expenses: {
    view: [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.ACCOUNTS,
      UserRole.SALES,
      UserRole.EMPLOYEE,
    ],
    create: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTS, UserRole.EMPLOYEE],
    edit: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTS, UserRole.EMPLOYEE],
    delete: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTS],
  },
};

// Routes access configuration
export const routeAccess: Record<string, UserRole[]> = {
  "/dashboard": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.ACCOUNTS,
    UserRole.SALES,
    UserRole.EMPLOYEE,
  ],
  "/dashboard/time": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.ACCOUNTS,
    UserRole.SALES,
    UserRole.EMPLOYEE,
  ],
  "/dashboard/clients": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.ACCOUNTS,
    UserRole.SALES,
    UserRole.EMPLOYEE,
  ],
  "/dashboard/projects": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.ACCOUNTS,
    UserRole.SALES,
    UserRole.EMPLOYEE,
  ],
  "/dashboard/invoices": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTS, UserRole.SALES],
  "/dashboard/expenses": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.ACCOUNTS,
    UserRole.SALES,
    UserRole.EMPLOYEE,
  ],
  "/dashboard/activity": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.ACCOUNTS,
    UserRole.SALES,
    UserRole.EMPLOYEE,
  ],
  "/dashboard/reports/revenue": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTS],
  "/dashboard/reports": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTS],
  "/dashboard/settings": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.ACCOUNTS,
    UserRole.SALES,
    UserRole.EMPLOYEE,
  ],
  "/dashboard/profile": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.ACCOUNTS,
    UserRole.SALES,
    UserRole.EMPLOYEE,
  ],
  "/dashboard/notifications": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.ACCOUNTS,
    UserRole.SALES,
    UserRole.EMPLOYEE,
  ],
  "/dashboard/admin": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
};

/**
 * Check if a user has permission to access a resource action
 */
export function hasResourcePermission(
  resource: string,
  action: keyof ResourcePermissions,
  userRole: UserRole
): boolean {
  const permissions = resourcePermissions[resource];
  if (!permissions) return false;

  return permissions[action].includes(userRole);
}

/**
 * Check if a user has permission to access a route
 */
export function hasRouteAccess(route: string, userRole: UserRole): boolean {
  // Check exact route match
  if (routeAccess[route]?.includes(userRole)) {
    return true;
  }

  // Check if any parent routes match
  for (const [path, roles] of Object.entries(routeAccess)) {
    if (route.startsWith(path) && roles.includes(userRole)) {
      return true;
    }
  }

  return false;
}

/**
 * Get filtered navigation items based on user role
 */
export function getAuthorizedNavItems(
  items: NavigationItem[],
  userRole: UserRole
): NavigationItem[] {
  return items.filter(item => hasRouteAccess(item.href, userRole));
}
