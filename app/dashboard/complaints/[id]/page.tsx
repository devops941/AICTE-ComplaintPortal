"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Copy, Loader2, Printer, ZoomIn, X, AlertCircle } from "lucide-react";

interface ComplaintData {
  complaintId: string;
  complainantName: string;
  email: string;
  phone: string;
  userCategory: string;
  institutionName: string;
  institutionState: string;
  aicteInstituteId?: string;
  category: string;
  subject: string;
  description: string;
  reliefSought?: string;
  images?: string[];
  officerImages?: string[];
  status: string;
  priority: string;
  createdAt: string;
  adminRemarks?: string;
  officerRemarks?: string;
  assignedOfficerName?: string;
}

export default function UserComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = typeof params.id === "string" ? decodeURIComponent(params.id) : "";

  const [complaint, setComplaint] = useState<ComplaintData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [zoomImg, setZoomImg] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("complaint_user");
    if (!raw) { router.push("/login"); return; }
    if (!complaintId) return;
    setIsLoading(true);
    fetch(`/api/complaints?complaintId=${encodeURIComponent(complaintId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.complaint) {
          setComplaint(data.complaint);
        } else {
          const user = raw ? JSON.parse(raw) : null;
          setComplaint({
            complaintId, complainantName: user?.fullName || "Complainant",
            email: user?.email || "", phone: user?.phone || "",
            userCategory: user?.userCategory || "student",
            institutionName: "Not available", institutionState: "N/A",
            category: "General", subject: "Complaint Details",
            description: "No details available.", status: "Submitted",
            priority: "Normal", createdAt: new Date().toISOString(),
          });
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [complaintId, router]);

  const handleCopy = () => { navigator.clipboard.writeText(complaintId); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const statusStyle = (s: string) => {
    const l = (s || "").toLowerCase();
    if (l.includes("resolved") || l.includes("closed")) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (l.includes("rejected")) return "bg-rose-100 text-rose-800 border-rose-200";
    if (l.includes("assigned")) return "bg-purple-100 text-purple-800 border-purple-200";
    if (l.includes("confirm") || l.includes("review")) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  const priorityStyle = (p: string) => {
    if (p?.toLowerCase() === "urgent") return "bg-red-100 text-red-700 border-red-200";
    if (p?.toLowerCase() === "high") return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  if (isLoading) return (
    <main className="flex-1 flex flex-col items-center justify-center py-24 gap-3">
      <Loader2 className="w-9 h-9 text-[#1e40af] animate-spin" />
      <p className="text-xs font-semibold text-slate-400">Loading complaint details...</p>
    </main>
  );

  if (!complaint) return (
    <main className="flex-1 flex flex-col items-center justify-center py-24 text-center gap-3">
      <AlertCircle size={40} className="text-amber-400" />
      <p className="font-bold text-slate-700">Complaint not found</p>
      <Link href="/dashboard/my-complaints" className="text-xs font-bold text-[#1e40af] no-underline hover:underline">← Back to My Complaints</Link>
    </main>
  );

  const filedDate = complaint.createdAt
    ? new Date(complaint.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "";

  return (
    <main className="p-4 sm:p-6 w-full space-y-4">

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/my-complaints" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#1e40af] no-underline">
          <ArrowLeft size={14} /> Back to My Complaints
        </Link>
        <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors">
          <Printer size={13} /> Print
        </button>
      </div>

      {/* ── SINGLE FULL-WIDTH CARD ── */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">

        {/* Header strip */}
        <div className="h-1 bg-gradient-to-r from-[#0f274a] via-[#1e40af] to-[#3b82f6]" />

        <div className="p-6 sm:p-8 space-y-6">

          {/* ── TOP: ID + STATUS + DATE ── */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-black text-xl text-[#1e40af]">{complaint.complaintId}</span>
                <button onClick={handleCopy} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#0f274a] leading-snug">{complaint.subject}</h1>
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusStyle(complaint.status)}`}>{complaint.status}</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${priorityStyle(complaint.priority)}`}>{complaint.priority} Priority</span>
              </div>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Filed On</p>
              <p className="text-sm font-bold text-slate-700 mt-0.5">{filedDate}</p>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* ── COMPLAINANT + INSTITUTION ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4">
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Complainant</p>
              <div className="space-y-2 text-sm">
                <Row label="Name" value={complaint.complainantName} />
                <Row label="Role" value={complaint.userCategory} capitalize />
                <Row label="Email" value={complaint.email} mono />
                <Row label="Phone" value={complaint.phone || "—"} mono />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institution</p>
              <div className="space-y-2 text-sm">
                <Row label="College" value={complaint.institutionName} />
                <Row label="State" value={complaint.institutionState} />
                <Row label="Category" value={complaint.category} />
                {complaint.aicteInstituteId && <Row label="AICTE ID" value={complaint.aicteInstituteId} mono />}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* ── DESCRIPTION ── */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{complaint.description}</p>
          </div>

          {complaint.reliefSought && (
            <>
              <div className="border-t border-slate-100" />
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Relief Sought</p>
                <p className="text-sm text-slate-700 leading-relaxed">{complaint.reliefSought}</p>
              </div>
            </>
          )}

          {/* ── ADMIN REMARKS ── */}
          {complaint.adminRemarks && (
            <>
              <div className="border-t border-slate-100" />
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Official Bureau Directive</p>
                <p className="text-sm text-emerald-800 leading-relaxed bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-200">{complaint.adminRemarks}</p>
              </div>
            </>
          )}

          {/* ── OFFICER REMARKS ── */}
          {complaint.officerRemarks && (
            <>
              <div className="border-t border-slate-100" />
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                  Officer Findings{complaint.assignedOfficerName ? ` — ${complaint.assignedOfficerName}` : ""}
                </p>
                <p className="text-sm text-indigo-900 leading-relaxed bg-indigo-50 rounded-xl px-4 py-3 border border-indigo-200">{complaint.officerRemarks}</p>
              </div>
            </>
          )}

          {/* ── OFFICER INVESTIGATION PHOTOS ── */}
          {complaint.officerImages && complaint.officerImages.length > 0 && (
            <>
              <div className="border-t border-slate-100" />
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                  Officer Investigation Photos{complaint.assignedOfficerName ? ` — ${complaint.assignedOfficerName}` : ""} ({complaint.officerImages.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {complaint.officerImages.map((img, idx) => (
                    <div key={idx} onClick={() => setZoomImg(img)} className="aspect-video rounded-xl overflow-hidden border border-indigo-200 cursor-pointer hover:border-indigo-400 transition-all group relative bg-indigo-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Investigation ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                        <ZoomIn size={13} /> View
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── PHOTOS ── */}
          {complaint.images && complaint.images.length > 0 && (
            <>
              <div className="border-t border-slate-100" />
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Attached Photos ({complaint.images.length})</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {complaint.images.map((img, idx) => (
                    <div key={idx} onClick={() => setZoomImg(img)} className="aspect-video rounded-xl overflow-hidden border border-slate-200 cursor-pointer hover:border-[#1e40af] transition-all group relative bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                        <ZoomIn size={13} /> View
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Zoom modal */}
      {zoomImg && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setZoomImg(null)}>
          <div className="relative max-w-3xl w-full bg-white rounded-2xl p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setZoomImg(null)} className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"><X size={18} /></button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={zoomImg} alt="Full view" className="max-h-[75vh] w-auto max-w-full mx-auto object-contain rounded-xl mt-4" />
          </div>
        </div>
      )}
    </main>
  );
}

function Row({ label, value, mono, capitalize }: { label: string; value: string; mono?: boolean; capitalize?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-slate-400 shrink-0 w-16">{label}</span>
      <span className={`text-xs font-semibold text-slate-800 text-right ${mono ? "font-mono" : ""} ${capitalize ? "capitalize" : ""}`}>{value}</span>
    </div>
  );
}
