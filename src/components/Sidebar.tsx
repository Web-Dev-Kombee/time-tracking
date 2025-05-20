"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Clock,
  LayoutDashboard,
  Users,
  FolderKanban,
  FileSpreadsheet,
  Receipt,
  BarChart3,
  Settings,
  Menu,
  X,
  ActivitySquare,
  BellRing,
  DollarSign,
} from "lucide-react";

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
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        isActive
          ? "bg-blue-100 text-blue-700"
          : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const isLinkActive = (href: string) => {
    if (href === "/dashboard" && pathname === "/dashboard") {
      return true;
    }
    return pathname.startsWith(href) && href !== "/dashboard";
  };

  const navItems = [
    {
      href: "/dashboard",
      icon: <LayoutDashboard size={18} />,
      label: "Dashboard",
    },
    {
      href: "/dashboard/time",
      icon: <Clock size={18} />,
      label: "Time Tracking",
    },
    {
      href: "/dashboard/clients",
      icon: <Users size={18} />,
      label: "Clients",
    },
    {
      href: "/dashboard/projects",
      icon: <FolderKanban size={18} />,
      label: "Projects",
    },
    {
      href: "/dashboard/invoices",
      icon: <FileSpreadsheet size={18} />,
      label: "Invoices",
    },
    {
      href: "/dashboard/expenses",
      icon: <Receipt size={18} />,
      label: "Expenses",
    },
    {
      href: "/dashboard/activity",
      icon: <ActivitySquare size={18} />,
      label: "Activity",
    },
    {
      href: "/dashboard/reports/revenue",
      icon: <DollarSign size={18} />,
      label: "Revenue",
    },
    {
      href: "/dashboard/reports",
      icon: <BarChart3 size={18} />,
      label: "Reports",
    },
    {
      href: "/dashboard/settings",
      icon: <Settings size={18} />,
      label: "Settings",
    },
    {
      href: "/dashboard/notifications",
      icon: <BellRing size={18} />,
      label: "Notifications",
    },
  ];

  return (
    <>
      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 bg-white p-2 rounded-md shadow-sm"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar background overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-full z-20 bg-white border-r shadow-sm w-64 transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">TimeTrack</span>
          </div>
        </div>

        <nav className="p-3 overflow-y-auto h-[calc(100vh-4rem)]">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavItem
                  href={item.href}
                  icon={item.icon}
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
