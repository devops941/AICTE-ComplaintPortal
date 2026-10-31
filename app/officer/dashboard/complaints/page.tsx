"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Loader2, Search, ClipboardList } from "lucide-react";

interface OfficerData { _id: string; fullName: string; employeeId: string; }

interface Complaint {
  _id: string;
  complaintId: string;
  complainantName: string;
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

export default function OfficerComplaintsPage() {
  const router = useRouter();
  const [officer, setOfficer] = useState<OfficerData | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const filtered = complaints.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.complaintId.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.institutionName.toLowerCase().includes(q) ||
      c.complainantName.toLowerCase().includes(q)
    );
  });

  return (
    <main className="p-4 sm:p-8 w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0f274a] tracking-tight">My Complaints</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            All complaints assigned to <span className="font-bold text-slate-800">{officer?.fullName || "you"}</span>
          </p>
        </div>
        <span className="self-start inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-[#1e40af]">
          <ClipboardList size={14} />
          {complaints.length} Total
        </span>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search size={15} />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID, subject, complainant or institution..."
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1e40af] focus:ring-3 focus:ring-blue-100 transition-all font-medium"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#1e40af] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <ClipboardList size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-400">
              {complaints.length === 0 ? "No complaints assigned yet" : "No complaints match your search"}
            </p>
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
                    <th className="py-3.5 px-6 hidden lg:table-cell">Date</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-[#1e40af] text-xs">{c.complaintId}</td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-800 block max-w-[200px] truncate">{c.subject}</span>
                        <span className="text-[11px] text-slate-500 truncate block max-w-[200px]">{c.institutionName}</span>
                      </td>
                      <td className="py-4 px-6 hidden sm:table-cell">
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryColor(c.category)}`}>{c.category || "General"}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-2xs ${getStatusBadge(c.status)}`}>{c.status}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-xs font-medium hidden lg:table-cell">
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
            <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Showing {filtered.length} of {complaints.length} complaints</span>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
