"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  UserCog,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Bell,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = () => {
    fetch("/api/notifications?recipientId=admin&recipientType=admin")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUnreadCount(data.notifications.filter((n: { isRead: boolean }) => !n.isRead).length);
      }).catch(() => {});
  };

  useEffect(() => {
    const session = localStorage.getItem("aicte_admin_logged");
    if (session !== "true") {
      router.push("/webadmin");
    } else {
      setCheckingAuth(false);
      fetchUnreadCount();
    }

    window.addEventListener("notifications-read", fetchUnreadCount);
    return () => window.removeEventListener("notifications-read", fetchUnreadCount);
  }, [router]);

  const handleAdminLogout = () => {
    localStorage.removeItem("aicte_admin_logged");
    router.push("/webadmin");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1e40af] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Verifying Admin Authority...
          </p>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      href: "/webadmin/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      isActive: pathname === "/webadmin/dashboard",
      iconBg: "bg-blue-50 text-[#1e40af]",
    },
    {
      href: "/webadmin/complaints",
      label: "All Complaints",
      icon: <FileText size={18} />,
      isActive: pathname.startsWith("/webadmin/complaints"),
      iconBg: "bg-amber-50 text-amber-600",
    },
    {
      href: "/webadmin/users",
      label: "All Users",
      icon: <Users size={18} />,
      isActive: pathname === "/webadmin/users",
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      href: "/webadmin/officers",
      label: "Officers",
      icon: <UserCog size={18} />,
      isActive: pathname.startsWith("/webadmin/officers"),
      iconBg: "bg-indigo-50 text-indigo-600",
      badge: undefined as string | undefined,
    },
    {
      href: "/webadmin/notifications",
      label: "Notifications",
      icon: <Bell size={18} />,
      isActive: pathname.startsWith("/webadmin/notifications"),
      iconBg: "bg-rose-50 text-rose-600",
      badge: unreadCount > 0 ? String(unreadCount) : undefined,
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 text-slate-800 font-sans relative overflow-x-hidden">
      {/* Tricolor Top Strip */}
      <div className="w-full h-[3px] bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#3b82f6] shrink-0 z-50" />

      <div className="flex-1 w-full flex">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static top-[3px] bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-xs ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div>
            {/* AICTE Header */}
            <div className="h-19 px-5 flex items-center justify-between border-b border-slate-100">
              <Link href="/webadmin/dashboard" className="flex items-center gap-3 no-underline group">
                <div className="relative w-11 h-11 shrink-0 flex items-center justify-center transition-transform group-hover:scale-105">
                  <Image
                    src="/images/logo.png"
                    alt="AICTE Official Seal"
                    width={44}
                    height={44}
                    className="w-full h-full object-contain drop-shadow-xs"
                    priority
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-black tracking-tight text-[#0f274a] leading-none">
                      AICTE
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 leading-none">
                      WebAdmin
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight leading-tight mt-0.5">
                    Control Panel
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Menu */}
            <nav className="p-3.5 space-y-1.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all no-underline ${
                    item.isActive
                      ? "bg-[#0f274a] text-white shadow-md shadow-blue-950/15"
                      : "text-slate-700 hover:bg-slate-100/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg ${
                        item.isActive ? "bg-white/15 text-white" : item.iconBg
                      } flex items-center justify-center transition-transform shadow-2xs`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.isActive ? "bg-white/20 text-white" : "bg-rose-100 text-rose-700 border border-rose-200"}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-100 space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Session Authority
              </span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5 truncate">
                admin@gmail.com
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active SuperAdmin
              </span>
            </div>

            <button
              type="button"
              onClick={handleAdminLogout}
              className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
              <span>Sign Out Admin</span>
            </button>
          </div>
        </aside>

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar */}
          <header className="h-19 bg-white border-b border-slate-200/90 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <Menu size={20} />
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="text-[#0f274a] font-bold">Central Administration Desk</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Full Authority Mode
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/"
                target="_blank"
                className="text-xs font-bold text-slate-500 hover:text-[#1e40af] inline-flex items-center gap-1 transition-colors no-underline"
              >
                <span>Citizen Portal</span>
                <ExternalLink size={12} />
              </Link>

              <Link href="/webadmin/notifications" className="relative p-2 text-slate-500 hover:text-[#1e40af] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer no-underline">
                <Bell size={18} />
                {unreadCount > 0 && <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">{unreadCount}</span>}
              </Link>

              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0f274a] to-[#1e40af] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  AD
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-bold text-slate-800 block leading-tight">
                    Administrator
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    admin@gmail.com
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Children Page Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

