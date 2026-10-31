"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText, Clock, CheckCircle2, ChevronRight, Eye, FilePlus2, X, Loader2,
} from "lucide-react";

interface ComplaintItem {
  id: string;
  title: string;
  category?: string;
  status: "Pending" | "Under Review" | "Resolved" | "Assigned" | "Closed" | "Submitted" | "Rejected";
  date: string;
  institutionName?: string;
  description?: string;
  reliefSought?: string;
  images?: string[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ fullName?: string; email?: string } | null>(null);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("complaint_user");
    if (!raw) { router.push("/login?redirect=/dashboard"); return; }
    try {
      const parsed = JSON.parse(raw);
      setUser(parsed);
      if (parsed.email) {
        fetch(`/api/complaints?email=${encodeURIComponent(parsed.email)}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.success && data.complaints?.length > 0) {
              setComplaints(data.complaints.map((c: any) => ({
                id: c.complaintId || c._id,
                title: c.subject || c.category || "General Complaint",
                status: c.status === "Submitted" ? "Pending" : c.status,
                date: new Date(c.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
                category: c.category,
                institutionName: c.institutionName,
              })));
            }
          })
          .catch(() => {})
          .finally(() => setIsLoadingComplaints(false));
      } else {
        setIsLoadingComplaints(false);
      }
    } catch { router.push("/login?redirect=/dashboard"); }
  }, [router]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Submitted": case "Pending": return "bg-blue-50 text-blue-800 border-blue-200/90";
      case "Confirmed": case "Under Review": return "bg-amber-50 text-amber-800 border-amber-200/90";
      case "Assigned": return "bg-purple-50 text-purple-800 border-purple-200/90";
      case "Resolved": return "bg-emerald-50 text-emerald-800 border-emerald-200/90";
      case "Closed": return "bg-slate-100 text-slate-700 border-slate-200";
      case "Rejected": return "bg-rose-50 text-rose-800 border-rose-200/90";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return "bg-slate-50 text-slate-700 border-slate-200";
    if (category.includes("Fee") || category.includes("Scholarship")) return "bg-amber-50 text-amber-800 border-amber-200/80";
    if (category.includes("Harassment") || category.includes("Ragging")) return "bg-rose-50 text-rose-800 border-rose-200/80";
    if (category.includes("Academic") || category.includes("Exam")) return "bg-blue-50 text-blue-800 border-blue-200/80";
    if (category.includes("Infrastructure") || category.includes("Hostel")) return "bg-purple-50 text-purple-800 border-purple-200/80";
    return "bg-teal-50 text-teal-800 border-teal-200/80";
  };

  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => ["Pending", "Under Review", "Assigned", "Submitted", "Confirmed"].includes(c.status)).length;
  const resolvedCount = complaints.filter((c) => ["Resolved", "Closed"].includes(c.status)).length;
  const rejectedCount = complaints.filter((c) => c.status === "Rejected").length;

  return (
    <>
      <main className="p-4 sm:p-8 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0f274a] tracking-tight">My Dashboard</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Welcome back, <span className="font-bold text-slate-800">{user?.fullName || "User"}</span>. Check and track all your complaints here.
            </p>
          </div>
          <Link href="/dashboard/new-complaint" className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0f274a] to-[#1e40af] hover:from-[#0a1c36] hover:to-[#1e3a8a] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-950/15 hover:shadow-lg transition-all cursor-pointer no-underline">
            <FilePlus2 size={16} />
            <span>+ New Complaint</span>
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-5 w-full">
          <div className="bg-white rounded-xl border border-slate-200/90 py-3.5 px-5 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[#1e40af] shrink-0 shadow-2xs"><FileText size={20} /></div>
              <div>
                <span className="text-xs font-bold text-slate-500 block leading-tight">Total</span>
                <span className="text-2xl font-black text-[#0f274a] leading-none mt-1 block">{totalCount}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1e40af] border border-blue-200">All Logged</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 py-3.5 px-5 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shrink-0 shadow-2xs"><Clock size={20} /></div>
              <div>
                <span className="text-xs font-bold text-slate-500 block leading-tight">Pending</span>
                <span className="text-2xl font-black text-[#0f274a] leading-none mt-1 block">{pendingCount}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">In Review</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 py-3.5 px-5 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs"><CheckCircle2 size={20} /></div>
              <div>
                <span className="text-xs font-bold text-slate-500 block leading-tight">Resolved</span>
                <span className="text-2xl font-black text-[#0f274a] leading-none mt-1 block">{resolvedCount}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 py-3.5 px-5 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shrink-0 shadow-2xs"><X size={20} /></div>
              <div>
                <span className="text-xs font-bold text-slate-500 block leading-tight">Rejected</span>
                <span className="text-2xl font-black text-[#0f274a] leading-none mt-1 block">{rejectedCount}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">Declined</span>
          </div>
        </div>

        {/* Recent Complaints Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0f274a]">Recent Complaints</h2>
              <p className="text-xs text-slate-500 font-medium">Latest status and updates on your complaints</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-700 font-bold text-[11px] sm:text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-6">ID</th>
                  <th className="py-3.5 px-6">Title</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingComplaints ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 text-[#1e40af] animate-spin" />
                        <span className="text-xs font-semibold text-slate-400">Loading your complaints...</span>
                      </div>
                    </td>
                  </tr>
                ) : complaints.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileText size={28} className="text-slate-200" />
                        <p className="text-sm font-bold text-slate-400">No complaints yet</p>
                        <Link href="/dashboard/new-complaint" className="text-xs font-bold text-[#1e40af] hover:underline no-underline">+ File your first complaint</Link>
                      </div>
                    </td>
                  </tr>
                ) : complaints.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#1e40af] text-xs">
                      <Link href={`/dashboard/complaints/${encodeURIComponent(item.id)}`} className="hover:underline cursor-pointer text-[#1e40af] font-mono font-bold no-underline">{item.id}</Link>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-800 block max-w-[200px] truncate">{item.title}</span>
                      {item.institutionName && <span className="text-[11px] text-slate-500 truncate block max-w-[200px]">{item.institutionName}</span>}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryColor(item.category)}`}>{item.category || "General"}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-2xs ${getStatusBadge(item.status)}`}>{item.status}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs font-medium">{item.date}</td>
                    <td className="py-4 px-6 text-right">
                      <Link href={`/dashboard/complaints/${encodeURIComponent(item.id)}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-[#1e40af] text-[#1e40af] hover:text-white font-bold text-xs transition-colors cursor-pointer no-underline">
                        <Eye size={13} /><span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
                </tbody>
            </table>
          </div>
          <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Showing {complaints.length} of {complaints.length} complaints</span>
            <Link href="/dashboard/my-complaints" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1e40af] hover:text-[#0f274a] transition-colors cursor-pointer no-underline">
              <span>View All Complaints</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </main>

    </>
  );
}
