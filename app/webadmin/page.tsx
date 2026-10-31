"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";

export default function WebAdminLoginPage() {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState("admin@gmail.com");
  const [adminPassword, setAdminPassword] = useState("12345678");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem("aicte_admin_logged");
    if (session === "true") {
      router.push("/webadmin/dashboard");
    } else {
      setCheckingSession(false);
    }
  }, [router]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    setTimeout(() => {
      if (adminEmail.trim().toLowerCase() === "admin@gmail.com" && adminPassword === "12345678") {
        localStorage.setItem("aicte_admin_logged", "true");
        router.push("/webadmin/dashboard");
      } else {
        setLoginError("Invalid Administrator credentials. Use admin@gmail.com and password 12345678.");
        setIsLoggingIn(false);
      }
    }, 400);
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 font-sans">
        <Loader2 className="w-8 h-8 text-[#1e40af] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* Tricolor Header Strip */}
      <div className="w-full h-[3px] bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#3b82f6]" />

      {/* Top Ministry Bar */}
      <div className="w-full bg-[#0f274a] text-slate-300 text-xs px-6 py-2.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">Government of India</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">Ministry of Education • Central Redressal Authority</span>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-white transition-colors no-underline font-semibold"
        >
          <span>Citizen Portal</span>
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* Center Admin Login Box */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden animate-scaleUp">
          {/* Top Accent Strip */}
          <div className="h-1.5 bg-gradient-to-r from-[#0f274a] via-[#1e40af] to-sky-500" />

          <div className="p-8 sm:p-10 space-y-6">
            {/* Header Logo */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto relative flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="AICTE Official Seal"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain drop-shadow-xs"
                  priority
                />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#1e40af] text-[10px] font-bold uppercase tracking-wider mb-1">
                  <ShieldCheck size={12} className="text-[#1e40af]" />
                  <span>Official Administrative Portal</span>
                </div>
                <h1 className="text-2xl font-black text-[#0f274a] tracking-tight">
                  AICTE WebAdmin
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Central Redressal Bureau Authority Login
                </p>
              </div>
            </div>

            {loginError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium animate-shake">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Administrator Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@gmail.com"
                    className="w-full h-11 pl-9 pr-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1e40af] focus:ring-3 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pl-9 pr-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1e40af] focus:ring-3 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Quick Credentials Info Box */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#0f274a] block">Demo Credentials:</span>
                  <span className="text-[11px] text-slate-600 font-mono">
                    admin@gmail.com / 12345678
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAdminEmail("admin@gmail.com");
                    setAdminPassword("12345678");
                  }}
                  className="text-[11px] font-bold text-[#1e40af] hover:underline cursor-pointer"
                >
                  Auto-Fill
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-11 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0f274a] to-[#1e40af] hover:from-[#0a1c36] hover:to-[#1e3a8a] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-70"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying Authority...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Admin Dashboard</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
