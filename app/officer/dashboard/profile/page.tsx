"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Info, UserCircle } from "lucide-react";

interface OfficerData {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  employeeId: string;
  status: string;
  createdAt?: string;
}

export default function OfficerProfilePage() {
  const router = useRouter();
  const [officer, setOfficer] = useState<OfficerData | null>(null);

  useEffect(() => {
    const session = localStorage.getItem("aicte_officer_session");
    if (!session) { router.push("/officer"); return; }
    try { setOfficer(JSON.parse(session)); } catch { router.push("/officer"); }
  }, [router]);

  const initials = officer?.fullName
    ? officer.fullName.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("")
    : "OF";

  const fields = [
    { label: "Full Name", value: officer?.fullName },
    { label: "Employee ID", value: officer?.employeeId },
    { label: "Email Address", value: officer?.email },
    { label: "Phone Number", value: officer?.phone || "—" },
    {
      label: "Account Status",
      value: officer?.status,
      render: (v: string) => v === "active"
        ? <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Active</span>
        : <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 border border-rose-200 text-rose-700"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" />Inactive</span>,
    },
    {
      label: "Joined",
      value: officer?.createdAt
        ? new Date(officer.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
        : "—",
    },
  ];

  return (
    <main className="p-4 sm:p-8 w-full space-y-6">
      {/* Page Header */}
      <div className="pb-2 border-b border-slate-200/60">
        <h1 className="text-2xl sm:text-3xl font-black text-[#0f274a] tracking-tight">Profile &amp; Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Your officer account information</p>
      </div>

      <div className="max-w-2xl space-y-5">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Avatar Header */}
          <div className="bg-gradient-to-r from-[#0f274a] to-[#1e40af] px-6 py-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-black text-white leading-tight">{officer?.fullName ?? "—"}</h2>
              <p className="text-blue-200 text-xs font-medium mt-0.5">{officer?.email ?? "—"}</p>
              <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/30">
                ID: {officer?.employeeId ?? "—"}
              </span>
            </div>
            <UserCircle size={40} className="ml-auto text-white/20 hidden sm:block" />
          </div>

          {/* Details */}
          <div className="divide-y divide-slate-100">
            {fields.map((field) => (
              <div key={field.label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 px-6 py-4">
                <span className="w-36 shrink-0 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{field.label}</span>
                <span className="text-sm font-semibold text-slate-800">
                  {"render" in field && field.render && field.value
                    ? field.render(field.value as string)
                    : (field.value ?? "—")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info Note */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-[#0f274a]">
          <Info size={16} className="shrink-0 mt-0.5 text-[#1e40af]" />
          <p className="text-xs font-medium leading-relaxed">
            To update your account details or change your password, please contact the AICTE Administration at <span className="font-bold">admin@aicte-india.org</span>.
          </p>
        </div>
      </div>
    </main>
  );
}
