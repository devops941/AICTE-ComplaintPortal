"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  LogIn,
  Phone,
  Search,
  User as UserIcon,
  ChevronDown,
  LogOut,
  ShieldCheck,
  FilePlus2,
  LayoutDashboard,
} from "lucide-react";

interface CurrentUser {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  userCategory?: "student" | "faculty" | string;
}

export default function Header() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Synchronize authentication status with localStorage
  const syncAuthState = () => {
    try {
      const stored = localStorage.getItem("complaint_user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    syncAuthState();

    window.addEventListener("storage", syncAuthState);
    window.addEventListener("user-auth-change", syncAuthState);

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("user-auth-change", syncAuthState);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("complaint_user");
    localStorage.removeItem("complaint_remember");
    setCurrentUser(null);
    setIsMenuOpen(false);
    window.dispatchEvent(new Event("user-auth-change"));
    router.push("/");
  };

  // Avatar initials
  const initials = currentUser?.fullName
    ? currentUser.fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join("")
    : "U";

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      {/* Royal Tricolor / Accent Line */}
      <div className="w-full h-[3px] bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#3b82f6]" />

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-3.5 flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3.5 no-underline group">
          <div className="relative w-13 h-13 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center transition-transform group-hover:scale-105">
            <Image
              src="/images/logo.png"
              alt="AICTE Official Seal"
              width={56}
              height={56}
              className="w-full h-full object-contain drop-shadow-xs"
              priority
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0f274a] group-hover:text-[#1e40af] transition-colors leading-none">
                AICTE
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-[#1e40af] bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 leading-none">
                Govt. of India
              </span>
            </div>
            <span className="text-xs sm:text-[13px] font-bold text-slate-800 leading-snug mt-0.5">
              All India Council for Technical Education
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 tracking-wide uppercase leading-tight">
              Institution Complaint &amp; Monitoring Portal
            </span>
          </div>
        </Link>

        {/* Navigation + Actions */}
        <div className="flex items-center gap-6 sm:gap-8">
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <Link
              href="/"
              className="text-[#1e40af] font-bold border-b-2 border-[#1e40af] pb-1 no-underline"
            >
              Home
            </Link>
            {currentUser && (
              <Link
                href="/dashboard"
                className="hover:text-[#1e40af] transition-colors no-underline font-bold text-slate-600"
              >
                Dashboard
              </Link>
            )}
            <Link
              href={currentUser ? "/dashboard/my-complaints" : "/login?redirect=/dashboard/my-complaints"}
              className="hover:text-[#1e40af] transition-colors no-underline flex items-center gap-1.5"
            >
              <Search size={14} className="text-slate-400" />
              <span>Track Complaint</span>
            </Link>
            <Link
              href="tel:1800112233"
              className="hover:text-[#1e40af] transition-colors no-underline hidden lg:flex items-center gap-1.5 text-slate-500"
            >
              <Phone size={13} className="text-amber-500" />
              <span>1800-11-2233</span>
            </Link>
          </nav>

          {/* Dynamic Auth Action: Profile pill if logged in, else Official Login button */}
          {currentUser ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer shadow-xs group"
                aria-label="User Account Menu"
              >
                {/* Initials Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0f274a] to-[#1e40af] text-white flex items-center justify-center text-xs font-black shadow-xs">
                  {initials}
                </div>

                {/* Name & Role Preview */}
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-xs font-bold text-[#0f274a] group-hover:text-[#1e40af] transition-colors max-w-[120px] truncate">
                    {currentUser.fullName || "My Account"}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 capitalize">
                    {currentUser.userCategory || "User"}
                  </span>
                </div>

                <ChevronDown
                  size={14}
                  className={`text-slate-500 transition-transform duration-200 ${
                    isMenuOpen ? "rotate-180 text-[#1e40af]" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
                  {/* User Header */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-[#0f274a] truncate">
                      {currentUser.fullName || "User"}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      {currentUser.email}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#1e40af] border border-blue-200">
                      <ShieldCheck size={11} />
                      <span className="capitalize">{currentUser.userCategory || "Citizen"}</span>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[#0f766e] hover:bg-slate-50 transition-colors no-underline"
                    >
                      <LayoutDashboard size={15} />
                      <span>My Dashboard</span>
                    </Link>

                    <Link
                      href="/register-complaint"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-[#1e40af] hover:bg-slate-50 transition-colors no-underline"
                    >
                      <FilePlus2 size={15} className="text-[#1e40af]" />
                      <span>Register Complaint</span>
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-[#1e40af] hover:bg-slate-50 transition-colors no-underline"
                    >
                      <UserIcon size={15} className="text-[#1e40af]" />
                      <span>My Profile &amp; Settings</span>
                    </Link>

                    <Link
                      href="#track"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-[#1e40af] hover:bg-slate-50 transition-colors no-underline"
                    >
                      <Search size={15} className="text-slate-400" />
                      <span>Track Complaints</span>
                    </Link>
                  </div>

                  {/* Sign Out */}
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0f274a] to-[#1e40af] hover:from-[#0a1c36] hover:to-[#1e3a8a] text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-950/15 hover:shadow-lg transition-all no-underline"
            >
              <LogIn size={15} />
              <span>Official Login</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
