"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, FilePlus2, Loader2, FileText } from "lucide-react";

interface ComplaintItem {
  id: string;
  title: string;
  category?: string;
  status: string;
  date: string;
  institutionName?: string;
}

export default function MyComplaintsPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("complaint_user");
    if (!raw) { router.push("/login?redirect=/dashboard/my-complaints"); return; }
    try {
      const parsed = JSON.parse(raw);
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
          .catch(console.error)
          .finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    } catch { router.push("/login"); }
  }, [router]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed": case "Under Review": return "bg-amber-50 text-amber-800 border-amber-200/90";
      case "Assigned": return "bg-purple-50 text-purple-800 border-purple-200/90";
      case "Resolved": return "bg-emerald-50 text-emerald-800 border-emerald-200/90";
      case "Closed": return "bg-slate-100 text-slate-700 border-slate-200";
      case "Rejected": return "bg-rose-50 text-rose-800 border-rose-200/90";
      default: return "bg-blue-50 text-blue-800 border-blue-200/90";
    }
  };

  const getCategoryColor = (cat?: string) => {
    if (!cat) return "bg-slate-50 text-slate-700 border-slate-200";
    if (cat.includes("Fee") || cat.includes("Scholarship")) return "bg-amber-50 text-amber-800 border-amber-200/80";
    if (cat.includes("Harassment") || cat.includes("Ragging")) return "bg-rose-50 text-rose-800 border-rose-200/80";
    if (cat.includes("Academic") || cat.includes("Exam")) return "bg-blue-50 text-blue-800 border-blue-200/80";
    if (cat.includes("Infrastructure") || cat.includes("Hostel")) return "bg-purple-50 text-purple-800 border-purple-200/80";
    return "bg-teal-50 text-teal-800 border-teal-200/80";
  };

  return (
    <main className="p-4 sm:p-8 w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0f274a] tracking-tight">My Complaints</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">View and track all your submitted complaints.</p>
        </div>
        <Link href="/dashboard/new-complaint" className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0f274a] to-[#1e40af] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all no-underline">
          <FilePlus2 size={16} />
          <span>+ New Complaint</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
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
              {isLoading ? (
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
                    <Link href={`/dashboard/complaints/${encodeURIComponent(item.id)}`} className="hover:underline text-[#1e40af] font-mono font-bold no-underline">
                      {item.id}
                    </Link>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-slate-800 block max-w-[220px] truncate">{item.title}</span>
                    {item.institutionName && <span className="text-[11px] text-slate-500 truncate block max-w-[220px]">{item.institutionName}</span>}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryColor(item.category)}`}>{item.category || "General"}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-2xs ${getStatusBadge(item.status)}`}>{item.status}</span>
                  </td>
                  <td className="py-4 px-6 text-slate-500 text-xs font-medium">{item.date}</td>
                  <td className="py-4 px-6 text-right">
                    <Link href={`/dashboard/complaints/${encodeURIComponent(item.id)}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-[#1e40af] text-[#1e40af] hover:text-white font-bold text-xs transition-colors no-underline">
                      <Eye size={13} /><span>View</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
