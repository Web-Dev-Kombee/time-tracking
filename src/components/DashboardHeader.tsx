"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  User,
  LogOut,
  Settings,
  ChevronDown,
  PlayCircle,
  PauseCircle,
} from "lucide-react";
import { NotificationDropdown } from "./NotificationDropdown";

export default function DashboardHeader() {
  const { data: session } = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
      {/* Left side - Quick Timer */}
      <div className="flex items-center">
        <button
          onClick={toggleTimer}
          className={`flex items-center gap-2 py-1.5 px-3 rounded-md ${
            isTimerRunning
              ? "text-red-600 hover:bg-red-50"
              : "text-green-600 hover:bg-green-50"
          }`}
        >
          {isTimerRunning ? (
            <>
              <PauseCircle size={18} />
              <span className="text-sm font-medium">Stop Timer</span>
            </>
          ) : (
            <>
              <PlayCircle size={18} />
              <span className="text-sm font-medium">Start Timer</span>
            </>
          )}
        </button>
      </div>

      {/* Right side - user account, notifications */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationDropdown />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={toggleUserMenu}
            className="flex items-center gap-2 hover:bg-gray-100 rounded-md p-1.5"
          >
            <div className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center">
              {session?.user?.name?.[0] || <User size={16} />}
            </div>
            <span className="text-sm font-medium hidden sm:inline-block">
              {session?.user?.name || "User"}
            </span>
            <ChevronDown size={16} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border">
              <div className="p-3 border-b">
                <p className="font-medium text-sm">{session?.user?.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email}
                </p>
              </div>
              <ul className="py-1">
                <li>
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User size={16} />
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                </li>
              </ul>
              <div className="border-t py-1">
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
