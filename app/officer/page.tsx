"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

export default function OfficerLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem("aicte_officer_session");
    if (session) {
      router.push("/officer/dashboard");
    } else {
      setCheckingSession(false);
    }
  }, [router]);

  const handleLogin = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/officer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(data.message || "Login failed. Please try again.");
        setIsLoggingIn(false);
        return;
      }

      localStorage.setItem("aicte_officer_session", JSON.stringify(data.officer));
      router.push("/officer/dashboard");
    } catch {
      setLoginError("Network error. Please check your connection.");
      setIsLoggingIn(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 font-sans">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* Tricolor Header Strip */}
      <div className="w-full h-[3px] bg-gradient-to-r from-indigo-900 via-indigo-600 to-indigo-400" />

      {/* Top Ministry Bar */}
      <div className="w-full bg-[#0f274a] text-slate-300 text-xs px-6 py-2.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">Government of India</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">Ministry of Education</span>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white transition-colors no-underline font-semibold"
        >
          <span>Citizen Portal</span>
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* Center Login Box */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Top Accent Strip */}
          <div className="h-1.5 bg-gradient-to-r from-indigo-900 via-indigo-600 to-indigo-400" />

          <div className="p-8 sm:p-10 space-y-6">
            {/* Header */}
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
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <ShieldCheck size={12} />
                  <span>Field Officer Authentication</span>
                </div>
                <h1 className="text-2xl font-black text-[#0f274a] tracking-tight">
                  Officer Portal
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  AICTE Field Officer Authentication
                </p>
              </div>
            </div>

            {loginError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email or Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your email or phone"
                    className="w-full h-11 pl-9 pr-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all font-medium"
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
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pl-9 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-11 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-70"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Officer Dashboard</span>
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
