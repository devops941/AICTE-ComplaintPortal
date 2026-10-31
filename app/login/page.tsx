"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  PhoneCall,
  LogIn,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to sign in. Please verify your credentials.");
        setIsLoading(false);
        return;
      }

      setSuccessMsg(`Welcome back, ${data.user.fullName}! Redirecting to dashboard...`);

      // Store session in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("complaint_user", JSON.stringify(data.user));
        if (rememberMe) {
          localStorage.setItem("complaint_remember", "true");
        }
        window.dispatchEvent(new Event("user-auth-change"));
      }

      let redirectTarget = "/dashboard";
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const target = params.get("redirect");
        if (target && target.startsWith("/")) {
          redirectTarget = target;
        }
      }

      setTimeout(() => {
        router.push(redirectTarget);
      }, 1200);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg("Network error. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 font-sans">
      {/* Top Header Bar */}
      <div className="w-full bg-[#0f274a] text-slate-300 text-xs px-6 sm:px-10 lg:px-14 py-2.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">Government of India</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">Ministry of Education</span>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-white transition-colors no-underline font-semibold"
        >
          <ArrowLeft size={14} />
          <span>Back to Main Portal</span>
        </Link>
      </div>

      {/* Main Split Container */}
      <div className="flex-1 w-full flex flex-col lg:flex-row">

        {/* Left: Single Universal Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-white">
          <div className="w-full max-w-md mx-auto my-auto py-6">

            {/* AICTE Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-200 mb-8">
              <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="AICTE Official Seal"
                  width={56}
                  height={56}
                  className="w-full h-full object-contain drop-shadow-xs"
                  priority
                />
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#1e40af] uppercase block tracking-wider">
                  AICTE Centralized Portal
                </span>
                <h1 className="text-2xl font-black text-[#0f274a] tracking-tight">
                  Sign In to Your Account
                </h1>
              </div>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-in fade-in duration-200">
                <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-semibold">{errorMsg}</div>
              </div>
            )}

            {/* Success Notification */}
            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3 animate-in fade-in duration-200">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-semibold">{successMsg}</div>
              </div>
            )}

            {/* Single Universal Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email / Username / Token ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Email Address or Mobile / ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={17} />
                  </div>
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter registered email or phone"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all shadow-xs disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    href="#forgot"
                    className="text-xs font-bold text-[#1e40af] hover:underline no-underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={17} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all shadow-xs disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1e40af] border-slate-300 focus:ring-[#1e40af]"
                  />
                  <span className="text-xs text-slate-600 font-medium">Keep me signed in</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#1e40af] to-[#2563eb] hover:from-[#1e3a8a] hover:to-[#1d4ed8] text-white font-bold text-sm shadow-md shadow-blue-900/20 hover:shadow-lg transition-all cursor-pointer inline-flex items-center justify-center gap-2 mt-3 disabled:opacity-75 disabled:cursor-wait"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    <span>Signing in securely...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Sign In to Portal</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-slate-600">
              New Applicant / Citizen?{" "}
              <Link href="/signup" className="font-bold text-[#1e40af] hover:underline no-underline">
                Register a Fresh Account
              </Link>
            </div>

            {/* Legal Warning Notice */}
            <div className="mt-8 pt-5 border-t border-slate-200 text-[11px] text-slate-400 text-center leading-relaxed">
              Unauthorized access or misuse of this Government portal is strictly prohibited under IT Act, 2000.
            </div>
          </div>
        </div>

        {/* Right: Government Information Showcase */}
        <div className="hidden lg:flex w-1/2 bg-[#0f274a] p-12 lg:p-16 flex-col justify-between text-white border-l border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-300 text-xs font-bold uppercase tracking-wider mb-6">
              <ShieldCheck size={14} className="text-blue-400" />
              <span>Ministry of Education Accredited Portal</span>
            </div>

            <h2 className="text-3xl font-extrabold text-white leading-tight">
              All India Council for Technical Education
            </h2>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070
            </p>

            {/* Official Photo */}
            <div className="mt-8 rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl aspect-[16/10] relative">
              <Image
                src="/images/aicte-headquarters.jpg"
                alt="AICTE Headquarters Building"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 text-xs font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>AICTE Main Administrative Complex</span>
              </div>
            </div>
          </div>

          {/* Compliance Notice */}

        </div>

      </div>
    </div>
  );
}
