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
  User,
  Phone,
  ShieldCheck,
  PhoneCall,
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [userCategory, setUserCategory] = useState<"student" | "faculty">("student");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please ensure both fields are identical.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (!agreeTerms) {
      setErrorMsg("Please accept the terms and conditions to proceed.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          userCategory,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to create account. Please try again.");
        setIsLoading(false);
        return;
      }

      setSuccessMsg(data.message || "Account created successfully! Redirecting to sign in...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
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
        
        {/* Left: Registration Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-white overflow-y-auto">
          <div className="w-full max-w-md mx-auto my-auto py-4">
            
            {/* AICTE Header */}
            <div className="flex items-center gap-4 pb-5 border-b border-slate-200 mb-6">
              <div className="w-13 h-13 shrink-0 flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="AICTE Official Seal"
                  width={52}
                  height={52}
                  className="w-full h-full object-contain drop-shadow-xs"
                  priority
                />
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#1e40af] uppercase block tracking-wider">
                  AICTE Centralized Portal
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-[#0f274a] tracking-tight">
                  Register Fresh Account
                </h1>
              </div>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-in fade-in duration-200">
                <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-semibold">{errorMsg}</div>
              </div>
            )}

            {/* Success Notification */}
            {successMsg && (
              <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3 animate-in fade-in duration-200">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-semibold">{successMsg}</div>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Ramesh Kumar / Ananya Sharma"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all shadow-xs disabled:bg-slate-100"
                  />
                </div>
              </div>

              {/* Email & Phone Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail size={15} />
                    </div>
                    <input
                      type="email"
                      required
                      disabled={isLoading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@domain.com"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all shadow-xs disabled:bg-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone size={15} />
                    </div>
                    <input
                      type="tel"
                      required
                      disabled={isLoading}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all shadow-xs disabled:bg-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* User Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { id: "student", label: "Student" },
                      { id: "faculty", label: "Faculty" },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      disabled={isLoading}
                      onClick={() => setUserCategory(cat.id)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        userCategory === cat.id
                          ? "bg-[#1e40af] text-white border-[#1e40af] shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Password & Confirm Password Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={15} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={isLoading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-8 pr-9 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all shadow-xs disabled:bg-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={15} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={isLoading}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all shadow-xs disabled:bg-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Agreement */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    disabled={isLoading}
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1e40af] border-slate-300 focus:ring-[#1e40af] mt-0.5"
                  />
                  <span className="text-xs text-slate-600 leading-snug">
                    I declare that all information is accurate and I agree to AICTE Terms &amp; Conditions.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#1e40af] to-[#2563eb] hover:from-[#1e3a8a] hover:to-[#1d4ed8] text-white font-bold text-sm shadow-md shadow-blue-900/20 hover:shadow-lg transition-all cursor-pointer inline-flex items-center justify-center gap-2 mt-2 disabled:opacity-75 disabled:cursor-wait"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Create Official Account</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-600">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-[#1e40af] hover:underline no-underline">
                Sign In to Portal
              </Link>
            </div>

            {/* Legal Warning Notice */}
            <div className="mt-6 pt-4 border-t border-slate-200 text-[11px] text-slate-400 text-center leading-relaxed">
              Providing false or fabricated information in statutory redressal matters is punishable under Indian Law.
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


        </div>

      </div>
    </div>
  );
}
