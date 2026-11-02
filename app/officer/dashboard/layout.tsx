"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell, Building, ClipboardList, LayoutDashboard,
  LogOut, Menu, UserCircle, X, ShieldCheck,
} from "lucide-react";

interface OfficerData {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  employeeId: string;
  status: string;
}

export default function OfficerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [officer, setOfficer] = useState<OfficerData | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = (id: string) => {
    fetch(`/api/notifications?recipientId=${encodeURIComponent(id)}&recipientType=officer`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUnreadCount(data.notifications.filter((n: { isRead: boolean }) => !n.isRead).length);
      }).catch(() => {});
  };

  useEffect(() => {
    const session = localStorage.getItem("aicte_officer_session");
    if (!session) { router.push("/officer"); return; }
    let interval: ReturnType<typeof setInterval>;
    try {
      const parsed = JSON.parse(session);
      setOfficer(parsed);
      setCheckingAuth(false);
      if (parsed._id) {
        fetchUnreadCount(parsed._id);
        interval = setInterval(() => fetchUnreadCount(parsed._id), 30000);
      }
    } catch {
      router.push("/officer");
    }

    const handleNotifChange = () => {
      const raw = localStorage.getItem("aicte_officer_session");
      if (!raw) return;
      try { const o = JSON.parse(raw); if (o._id) fetchUnreadCount(o._id); } catch { /* ignore */ }
    };
    window.addEventListener("notifications-read", handleNotifChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications-read", handleNotifChange);
    };
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem("aicte_officer_session");
    router.push("/officer");
  };

  const initials = officer?.fullName
    ? officer.fullName.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("")
    : "OF";

  const navItems = [
    { href: "/officer/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} />, iconColor: "text-[#1e40af]", iconBg: "bg-blue-50", exact: true, badge: undefined as string | undefined },
    { href: "/officer/dashboard/complaints", label: "My Complaints", icon: <ClipboardList size={18} />, iconColor: "text-amber-600", iconBg: "bg-amber-50", exact: false, badge: undefined as string | undefined },
    { href: "/officer/dashboard/notifications", label: "Notifications", icon: <Bell size={18} />, iconColor: "text-rose-600", iconBg: "bg-rose-50", exact: false, badge: unreadCount > 0 ? String(unreadCount) : undefined },
    { href: "/officer/dashboard/profile", label: "Profile & Settings", icon: <UserCircle size={18} />, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", exact: false, badge: undefined as string | undefined },
  ];

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  if (checkingAuth) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1e40af] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verifying Officer Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 text-slate-800 font-sans relative overflow-x-hidden">
      <div className="w-full h-[3px] bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#3b82f6] shrink-0 z-50" />

      <div className="flex-1 w-full flex">
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:static top-[3px] bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-xs ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          <div>
            <div className="h-19 px-5 flex items-center justify-between border-b border-slate-100">
              <Link href="/officer/dashboard" className="flex items-center gap-3 no-underline group">
                <div className="relative w-11 h-11 shrink-0 flex items-center justify-center transition-transform group-hover:scale-105">
                  <Image src="/images/logo.png" alt="AICTE" width={44} height={44} className="w-full h-full object-contain drop-shadow-xs" priority />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-black tracking-tight text-[#0f274a] group-hover:text-[#1e40af] transition-colors leading-none">AICTE</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#1e40af] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60 leading-none">Officer</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight leading-tight mt-0.5">Officer Portal</span>
                </div>
              </Link>
              <button type="button" onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"><X size={18} /></button>
            </div>

            <nav className="p-3.5 space-y-1.5">
              {navItems.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all no-underline ${active ? "bg-[#0f274a] text-white shadow-md shadow-blue-950/15" : "text-slate-700 hover:bg-slate-100/80"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg ${active ? "bg-white/15 text-white" : `${item.iconBg} ${item.iconColor}`} flex items-center justify-center shadow-2xs`}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-rose-100 text-rose-700 border border-rose-200"}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="mx-3.5 mt-2 p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50/50 border border-blue-100/90 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-[#1e40af] font-bold mb-1">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Officer Session</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug mb-1.5">Logged in as field officer:</p>
              <span className="font-bold text-[#0f274a] text-xs block truncate">{officer?.fullName}</span>
              <span className="font-mono text-[11px] text-slate-500">{officer?.employeeId}</span>
            </div>
          </div>

          <div className="p-3.5 border-t border-slate-100 space-y-1">
            <Link href="/" className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#1e40af] hover:bg-slate-100 transition-colors no-underline">
              <Building size={14} className="text-slate-400" />
              <span>Back to Main Portal</span>
            </Link>
            <button type="button" onClick={handleSignOut} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left">
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Header */}
          <header className="h-19 bg-white border-b border-slate-200/90 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer">
                <Menu size={20} />
              </button>
              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="text-[#0f274a] font-bold">Officer Complaint Portal</span>
                <span>•</span>
                <span>AICTE Field Division</span>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="/officer/dashboard/notifications" className="relative p-2 text-slate-500 hover:text-[#1e40af] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer no-underline">
                <Bell size={18} />
                {unreadCount > 0 && <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">{unreadCount}</span>}
              </Link>
              <Link href="/officer/dashboard/profile" className={`flex items-center gap-2.5 p-1 pr-3 rounded-full border transition-all shadow-2xs cursor-pointer no-underline ${pathname === "/officer/dashboard/profile" ? "border-[#1e40af] bg-blue-50/80" : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300"}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0f274a] to-[#1e40af] text-white flex items-center justify-center text-xs font-black shadow-2xs">{initials}</div>
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-xs font-bold text-[#0f274a] truncate max-w-[120px]">{officer?.fullName || "Officer"}</span>
                  <span className="text-[10px] font-semibold text-slate-500">Field Officer</span>
                </div>
              </Link>
            </div>
          </header>

          {children}
        </div>
      </div>
    </div>
  );
}
