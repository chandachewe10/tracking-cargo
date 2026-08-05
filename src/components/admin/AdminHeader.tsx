"use client";

import { signOut } from "next-auth/react";
import { User, LogOut, Bell, Menu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import {
  Package,
  LayoutDashboard,
  Truck,
  PlusCircle,
  BarChart2,
  ClipboardList,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

const mobileNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Shipments", href: "/admin/shipments", icon: Truck },
  { label: "New", href: "/admin/shipments/new", icon: PlusCircle },
  { label: "Reports", href: "/admin/reports", icon: BarChart2 },
  { label: "Audit Log", href: "/admin/audit-log", icon: ClipboardList },
];

export default function AdminHeader({ user }: AdminHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Mobile logo + menu */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-gray-900">LuxShipCargo</span>
          </div>
        </div>

        <div className="hidden lg:block" />

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 relative">
            <Bell className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-none">
                  {user.name || "Admin"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-3 py-2 border-b border-gray-100 sm:hidden">
                  <p className="text-sm font-medium">{user.name || "Admin"}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Nav Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-gray-900 text-white px-4 py-3 space-y-1 border-b border-gray-800">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Close dropdown on outside click */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </>
  );
}
