"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FilePlus2,
  Search,
  ShieldCheck,
  Lock,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function Hero() {
  const router = useRouter();

  const handleRegisterComplaint = (e: React.MouseEvent) => {
    e.preventDefault();
    const user = typeof window !== "undefined" ? localStorage.getItem("complaint_user") : null;
    if (user) {
      router.push("/dashboard/new-complaint");
    } else {
      router.push("/login?redirect=/dashboard/new-complaint");
    }
  };

  const handleTrackComplaint = (e: React.MouseEvent) => {
    e.preventDefault();
    const user = typeof window !== "undefined" ? localStorage.getItem("complaint_user") : null;
    if (user) {
      router.push("/dashboard/my-complaints");
    } else {
      router.push("/login?redirect=/dashboard/my-complaints");
    }
  };
  return (
    <section className="relative w-full px-6 sm:px-10 lg:px-12 pt-10 pb-8 lg:pt-14 lg:pb-12 overflow-hidden">
      {/* Ambient Royal Lighting Glow */}
      <div className="absolute top-0 right-1/4 w-[480px] h-[480px] bg-blue-300/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-[380px] h-[380px] bg-indigo-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

        {/* Left Column (Content) */}
        <div className="lg:col-span-6 flex flex-col items-start justify-center z-10">

          {/* Royal Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 border border-blue-200 text-[#1e40af] mb-5 shadow-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1e40af]" />
            </span>
            <span className="text-xs font-bold tracking-wider uppercase">
              AICTE Official Complaint Portal
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black text-[#0b1e36] leading-[1.12] tracking-tight">
            Institution Complaint &amp;<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1e40af] via-[#2563eb] to-[#0284c7]">
              Monitoring Portal
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg font-normal">
            An easy-to-use portal to submit, track, and resolve college and academic complaints quickly and transparently.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleRegisterComplaint}
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#1e40af] to-[#2563eb] hover:from-[#1e3a8a] hover:to-[#1d4ed8] text-white text-sm font-bold shadow-lg shadow-blue-900/25 hover:shadow-xl transition-all cursor-pointer"
            >
              <FilePlus2 size={17} />
              <span>Register Complaint</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={handleTrackComplaint}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-blue-50/60 text-[#1e40af] border-2 border-[#1e40af]/30 hover:border-[#1e40af] text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Search size={16} />
              <span>Track Complaint</span>
            </button>
          </div>

          {/* Trust Chips */}
          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-slate-600 font-semibold">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-xs">
              <ShieldCheck size={15} className="text-emerald-600" />
              <span>Government Approved</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-xs">
              <Lock size={14} className="text-emerald-600" />
              <span>Safe &amp; Secure</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-xs">
              <Clock size={14} className="text-[#1e40af]" />
              <span>Fast Resolution</span>
            </div>
          </div>

        </div>

        {/* Right Column: Background Image in That Particular Same Place */}
        <div className="lg:col-span-6 relative flex items-center justify-center lg:justify-end">
          
          {/* Ambient Royal Backlight Glow */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-[#1e40af]/20 to-blue-400/20 rounded-3xl blur-2xl -z-10" />

          {/* The Background Image Container in the same place */}
          <div
            className="group relative w-full max-w-[560px] aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl shadow-blue-950/20 border border-slate-200/80 bg-cover bg-center transition-all duration-700 hover:scale-[1.02]"
            style={{
              backgroundImage: "url('/images/aicte-headquarters.jpg')",
            }}
          >
            {/* Soft elegant gradient wash over the background image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0b1e36]/30 via-transparent to-blue-500/10 transition-opacity duration-500 group-hover:opacity-60" />
            
            {/* Subtle soft vignette on inner edges */}
            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-3xl pointer-events-none" />
          </div>

        </div>

      </div>
    </section>
  );
}
