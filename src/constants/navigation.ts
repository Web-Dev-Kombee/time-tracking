import { LucideIcon } from "lucide-react";

// Interface for navigation items
export interface MarketingNavItem {
  href: string;
  label: string;
}

export interface DashboardNavItem {
  href: string;
  label: string;
  iconName: string;
}

// Marketing navigation
export const MARKETING_NAV: MarketingNavItem[] = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/login", label: "Log in" },
  { href: "/register", label: "Sign up free" },
];

// Dashboard navigation items
export const ALL_NAV_ITEMS: DashboardNavItem[] = [
  {
    href: "/dashboard",
    iconName: "LayoutDashboard",
    label: "Dashboard",
  },
  {
    href: "/dashboard/time",
    iconName: "Clock",
    label: "Time Tracking",
  },
  {
    href: "/dashboard/clients",
    iconName: "Users",
    label: "Clients",
  },
  {
    href: "/dashboard/projects",
    iconName: "FolderKanban",
    label: "Projects",
  },
  {
    href: "/dashboard/invoices",
    iconName: "FileSpreadsheet",
    label: "Invoices",
  },
  {
    href: "/dashboard/expenses",
    iconName: "Receipt",
    label: "Expenses",
  },
  {
    href: "/dashboard/activity",
    iconName: "ActivitySquare",
    label: "Activity",
  },
  {
    href: "/dashboard/reports/revenue",
    iconName: "DollarSign",
    label: "Revenue",
  },
  {
    href: "/dashboard/reports",
    iconName: "BarChart3",
    label: "Reports",
  },
  {
    href: "/dashboard/admin",
    iconName: "Shield",
    label: "Admin",
  },
  {
    href: "/dashboard/profile",
    iconName: "User",
    label: "Profile",
  },
  {
    href: "/dashboard/settings",
    iconName: "Settings",
    label: "Settings",
  },
  {
    href: "/dashboard/notifications",
    iconName: "BellRing",
    label: "Notifications",
  },
];
