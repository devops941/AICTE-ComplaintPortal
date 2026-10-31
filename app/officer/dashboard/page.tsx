"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardList, Clock, CheckCircle2, ChevronRight, Eye, X, Loader2 } from "lucide-react";

interface OfficerData {
  _id: string;
  fullName: string;
  email: string;
  employeeId: string;
  status: string;
}

interface Complaint {
  _id: string;
  complaintId: string;
  subject: string;
  category?: string;
  institutionName: string;
  status: string;
  createdAt: string;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "Resolved": return "bg-emerald-50 text-emerald-800 border-emerald-200/90";
    case "Rejected": return "bg-rose-50 text-rose-800 border-rose-200/90";
    case "Assigned": return "bg-purple-50 text-purple-800 border-purple-200/90";
    case "Closed": return "bg-slate-100 text-slate-700 border-slate-200";
    default: return "bg-amber-50 text-amber-800 border-amber-200/90";
  }
}

function getCategoryColor(category?: string) {
  if (!category) return "bg-slate-50 text-slate-700 border-slate-200";
  if (category.includes("Fee")) return "bg-amber-50 text-amber-800 border-amber-200/80";
  if (category.includes("Harassment") || category.includes("Ragging")) return "bg-rose-50 text-rose-800 border-rose-200/80";
  if (category.includes("Academic") || category.includes("Exam")) return "bg-blue-50 text-blue-800 border-blue-200/80";
  if (category.includes("Infrastructure") || category.includes("Hostel")) return "bg-purple-50 text-purple-800 border-purple-200/80";
  return "bg-teal-50 text-teal-800 border-teal-200/80";
}

export default function OfficerDashboardPage() {
  const router = useRouter();
  const [officer, setOfficer] = useState<OfficerData | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem("aicte_officer_session");
    if (!session) { router.push("/officer"); return; }
    try {
      const parsed: OfficerData = JSON.parse(session);
      setOfficer(parsed);
      fetch(`/api/officer/complaints?officerId=${parsed._id}`)
        .then((r) => r.json())
        .then((data) => { if (data.success) setComplaints(data.complaints); })
        .catch(() => {})
        .finally(() => setLoading(false));
    } catch { router.push("/officer"); }
  }, [router]);

  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => !["Resolved", "Rejected", "Closed"].includes(c.status)).length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length;
  const rejectedCount = complaints.filter((c) => c.status === "Rejected").length;

  return (
    <main className="p-4 sm:p-8 w-full space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0f274a] tracking-tight">Officer Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Welcome back, <span className="font-bold text-slate-800">{officer?.fullName || "Officer"}</span>. Track and manage your assigned complaints here.
          </p>
        </div>
        <span className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600">
          ID: {officer?.employeeId || "—"}
        </span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-5 w-full">
        <div className="bg-white rounded-xl border border-slate-200/90 py-3.5 px-5 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[#1e40af] shrink-0 shadow-2xs"><ClipboardList size={20} /></div>
            <div>
              <span className="text-xs font-bold text-slate-500 block leading-tight">Total</span>
              <span className="text-2xl font-black text-[#0f274a] leading-none mt-1 block">{loading ? "—" : totalCount}</span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1e40af] border border-blue-200">Assigned</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 py-3.5 px-5 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shrink-0 shadow-2xs"><Clock size={20} /></div>
            <div>
              <span className="text-xs font-bold text-slate-500 block leading-tight">Pending</span>
              <span className="text-2xl font-black text-[#0f274a] leading-none mt-1 block">{loading ? "—" : pendingCount}</span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Active</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 py-3.5 px-5 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs"><CheckCircle2 size={20} /></div>
            <div>
              <span className="text-xs font-bold text-slate-500 block leading-tight">Resolved</span>
              <span className="text-2xl font-black text-[#0f274a] leading-none mt-1 block">{loading ? "—" : resolvedCount}</span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 py-3.5 px-5 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shrink-0 shadow-2xs"><X size={20} /></div>
            <div>
              <span className="text-xs font-bold text-slate-500 block leading-tight">Rejected</span>
              <span className="text-2xl font-black text-[#0f274a] leading-none mt-1 block">{loading ? "—" : rejectedCount}</span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">Declined</span>
        </div>
      </div>

      {/* Recent Assignments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0f274a]">Recent Assignments</h2>
            <p className="text-xs text-slate-500 font-medium">Latest complaints assigned to you</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#1e40af] animate-spin" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-16 text-center">
            <ClipboardList size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-400">No complaints assigned yet</p>
            <p className="text-xs text-slate-400 mt-1">When admin assigns complaints to you, they will appear here.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-700 font-bold text-[11px] sm:text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-6">ID</th>
                    <th className="py-3.5 px-6">Title</th>
                    <th className="py-3.5 px-6 hidden sm:table-cell">Category</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 hidden md:table-cell">Date</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.slice(0, 5).map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-[#1e40af] text-xs">{c.complaintId}</td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-800 block max-w-[180px] truncate">{c.subject}</span>
                        <span className="text-[11px] text-slate-500 truncate block max-w-[180px]">{c.institutionName}</span>
                      </td>
                      <td className="py-4 px-6 hidden sm:table-cell">
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryColor(c.category)}`}>{c.category || "General"}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-2xs ${getStatusBadge(c.status)}`}>{c.status}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-xs font-medium hidden md:table-cell">
                        {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link href={`/officer/dashboard/complaints/${encodeURIComponent(c.complaintId)}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-[#1e40af] text-[#1e40af] hover:text-white font-bold text-xs transition-colors no-underline">
                          <Eye size={13} /><span>View</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Showing {Math.min(5, complaints.length)} of {complaints.length} complaints</span>
              <Link href="/officer/dashboard/complaints" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1e40af] hover:text-[#0f274a] transition-colors no-underline">
                <span>View All Complaints</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
