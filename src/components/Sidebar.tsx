"use client";

import { ALL_NAV_ITEMS } from "@/constants";
import { getAuthorizedNavItems, NavigationItem } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";
import {
  ActivitySquare,
  BarChart3,
  BellRing,
  Clock,
  DollarSign,
  FileSpreadsheet,
  FolderKanban,
  LayoutDashboard,
  LucideIcon,
  Menu,
  Receipt,
  Settings,
  Shield,
  User,
  Users,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-foreground hover:text-primary hover:bg-primary/5"
      )}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </Link>
  );
}

// Create a React component wrapper for icons
const IconWrapper = (icon: React.ReactNode): React.FC<{ className?: string }> => {
  const Component: React.FC<{ className?: string }> = ({ className }) => (
    <div className={className}>{icon}</div>
  );
  return Component;
};

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const userRole = (session?.user?.role as UserRole) || UserRole.EMPLOYEE;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const isLinkActive = (href: string) => {
    if (href === "/dashboard" && pathname === "/dashboard") {
      return true;
    }
    return pathname.startsWith(href) && href !== "/dashboard";
  };

  // Function to get the icon component from icon name
  const getIconComponent = (iconName: string, size = 18) => {
    const icons: Record<string, LucideIcon> = {
      LayoutDashboard,
      Clock,
      Users,
      FolderKanban,
      FileSpreadsheet,
      Receipt,
      BarChart3,
      Settings,
      ActivitySquare,
      BellRing,
      DollarSign,
      Shield,
      User,
    };

    const IconComponent = icons[iconName];
    if (IconComponent) {
      return <IconComponent size={size} />;
    }
    return <Clock size={size} />;
  };

  // Convert the constants to the format expected by the components
  const allNavItems: NavigationItem[] = ALL_NAV_ITEMS.map(item => ({
    ...item,
    icon: IconWrapper(getIconComponent(item.iconName)),
  }));

  // Filter navigation items based on user's role
  const navItems = getAuthorizedNavItems(allNavItems, userRole);

  return (
    <>
      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 bg-background p-2 rounded-md shadow-sm border"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar background overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-20" onClick={toggleSidebar} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 h-full z-20 bg-card border-r shadow-sm w-64 transition-transform duration-300 transform",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">TimeTrack</span>
          </div>
          {session?.user && (
            <div className="mt-2 text-sm text-muted-foreground">
              Role: {session.user.role.toLowerCase().replace("_", " ")}
            </div>
          )}
        </div>

        <nav className="p-3 overflow-y-auto h-[calc(100vh-4rem)]">
          <ul className="space-y-1">
            {navItems.map(item => (
              <li key={item.href}>
                <NavItem
                  href={item.href}
                  icon={item.icon as React.ReactNode}
                  label={item.label}
                  isActive={isLinkActive(item.href)}
                />
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
