"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Loader2, AlertCircle, CheckCircle2,
  Save, User, Building, FileText, ShieldCheck, MessageSquare,
  Upload, ZoomIn, X, ImageIcon, Camera,
} from "lucide-react";

interface ComplaintDetail {
  complaintId: string;
  complainantName: string;
  email: string;
  phone: string;
  userCategory: string;
  institutionName: string;
  institutionState: string;
  category: string;
  subject: string;
  description: string;
  reliefSought?: string;
  images?: string[];
  officerImages?: string[];
  status: string;
  priority: string;
  adminRemarks?: string;
  officerRemarks?: string;
  assignedOfficerName?: string;
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

export default function OfficerComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = typeof params.id === "string" ? decodeURIComponent(params.id) : "";

  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusVal, setStatusVal] = useState("");
  const [officerRemarks, setOfficerRemarks] = useState("");
  const [officerImages, setOfficerImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [zoomImg, setZoomImg] = useState<string | null>(null);

  useEffect(() => {
    const session = localStorage.getItem("aicte_officer_session");
    if (!session) { router.push("/officer"); return; }
  }, [router]);

  useEffect(() => {
    if (!complaintId) return;
    fetch(`/api/complaints?complaintId=${encodeURIComponent(complaintId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.complaint) {
          const c = data.complaint;
          setComplaint(c);
          setStatusVal(c.status);
          setOfficerRemarks(c.officerRemarks || "");
          setOfficerImages(c.officerImages || []);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [complaintId]);

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const res = await fetch("/api/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintId,
          status: statusVal,
          officerRemarks: officerRemarks.trim(),
          officerImages,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/officer/dashboard/complaints");
      } else {
        setErrorMsg(data.error || "Failed to update.");
        setIsSaving(false);
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setIsSaving(false);
    }
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5MB."); return; }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setOfficerImages((prev) => [...prev, url]);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveOfficerImage = (idx: number) => {
    setOfficerImages((prev) => prev.filter((_, i) => i !== idx));
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1e40af] animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading Complaint Details...</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle size={44} className="text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Complaint Not Found</h2>
        <p className="text-xs text-slate-500">No record found for: <span className="font-mono font-bold">{complaintId}</span></p>
        <Link href="/officer/dashboard/complaints" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0f274a] text-white text-xs font-bold hover:bg-[#1e40af] no-underline transition-colors">
          <ArrowLeft size={14} />Back to My Complaints
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(complaint.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const isFinalized = complaint.status === "Resolved" || complaint.status === "Rejected";

  return (
    <main className="p-4 sm:p-8 w-full space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/officer/dashboard/complaints" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#1e40af] transition-colors no-underline">
          <ArrowLeft size={15} />Back to My Complaints
        </Link>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${getStatusBadge(complaint.status)}`}>
          {complaint.status}
        </span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-3">
        <h1 className="text-xl font-black text-[#0f274a] tracking-tight">{complaint.subject}</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-xs text-[#1e40af] font-bold">{complaint.complaintId}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase">{complaint.priority} Priority</span>
          <span className="text-xs text-slate-500 font-medium">{formattedDate}</span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
            <User size={15} className="text-[#1e40af]" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Complainant Particulars</span>
          </div>
          <div className="p-5 space-y-3 text-xs">
            {[
              { label: "Name", value: complaint.complainantName },
              { label: "Role", value: complaint.userCategory },
              { label: "Email", value: complaint.email },
              { label: "Phone", value: complaint.phone || "Not recorded" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between gap-2">
                <span className="text-slate-500 font-medium shrink-0">{row.label}:</span>
                <span className="font-bold text-slate-800 text-right">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
            <Building size={15} className="text-[#1e40af]" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Institution Details</span>
          </div>
          <div className="p-5 space-y-3 text-xs">
            {[
              { label: "College", value: complaint.institutionName },
              { label: "State", value: complaint.institutionState },
              { label: "Category", value: complaint.category },
            ].map((row) => (
              <div key={row.label} className="flex justify-between gap-2">
                <span className="text-slate-500 font-medium shrink-0">{row.label}:</span>
                <span className="font-bold text-slate-800 text-right">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
          <FileText size={15} className="text-[#1e40af]" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Complaint Description &amp; Stated Facts</span>
        </div>
        <div className="p-5 space-y-4">
          <p className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed text-sm whitespace-pre-line">{complaint.description}</p>
          {complaint.reliefSought && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Requested Solution / Relief Sought:</span>
              <p className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-[#0f274a] leading-relaxed text-sm font-medium">&ldquo;{complaint.reliefSought}&rdquo;</p>
            </div>
          )}
          {complaint.adminRemarks && (
            <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200 p-4 space-y-1">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <ShieldCheck size={14} className="text-emerald-700" />
                <span>Official Bureau Directive</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed pl-5">{complaint.adminRemarks}</p>
            </div>
          )}
        </div>
      </div>

      {/* Complainant Photos — read only */}
      {complaint.images && complaint.images.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
            <ImageIcon size={15} className="text-[#1e40af]" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Complainant Attached Photos
            </span>
            <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
              {complaint.images.length} file{complaint.images.length !== 1 ? "s" : ""} · read only
            </span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {complaint.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setZoomImg(img)}
                  className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 hover:border-[#1e40af] transition-all shadow-2xs cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                    <ZoomIn size={14} /> View
                  </div>
                  <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded font-mono">#{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Officer Action Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
          <MessageSquare size={15} className="text-[#1e40af]" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Officer Action &amp; Findings</span>
          {isFinalized && (
            <span className={`ml-auto text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${complaint.status === "Resolved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
              {complaint.status} · No further changes allowed
            </span>
          )}
        </div>
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              <AlertCircle size={15} className="text-red-600 shrink-0" />{errorMsg}
            </div>
          )}

          {isFinalized ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <CheckCircle2 size={18} className={complaint.status === "Resolved" ? "text-emerald-500 shrink-0" : "text-rose-500 shrink-0"} />
                <div>
                  <p className="text-sm font-bold text-slate-800">This complaint has been {complaint.status.toLowerCase()}.</p>
                  <p className="text-xs text-slate-500 mt-0.5">The findings have been recorded and no further modifications are permitted.</p>
                </div>
              </div>
              {officerRemarks && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Recorded Findings / Remarks</label>
                  <p className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 leading-relaxed whitespace-pre-line">{officerRemarks}</p>
                </div>
              )}
              {officerImages.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Investigation Photos</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {officerImages.map((img, idx) => (
                      <div key={idx} onClick={() => setZoomImg(img)} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 cursor-pointer hover:border-[#1e40af] transition-all shadow-2xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Investigation ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                          <ZoomIn size={14} /> View
                        </div>
                        <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded font-mono">#{idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Update Status</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                  className="w-full sm:w-64 h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#1e40af] focus:ring-3 focus:ring-blue-100 transition-all cursor-pointer"
                >
                  <option value="Assigned">Assigned</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Officer Findings / Remarks
                  <span className="ml-2 text-[10px] font-semibold text-slate-400 normal-case tracking-normal">(visible to student &amp; admin)</span>
                </label>
                <textarea
                  value={officerRemarks}
                  onChange={(e) => setOfficerRemarks(e.target.value)}
                  rows={4}
                  placeholder="Describe your investigation findings, action taken, or any relevant observations..."
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-sm text-slate-900 focus:outline-none focus:border-[#1e40af] focus:ring-3 focus:ring-blue-100 transition-all font-medium resize-none"
                />
              </div>

              {/* Investigation Photos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera size={14} className="text-[#1e40af]" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Your Investigation Photos</span>
                    {officerImages.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1e40af] border border-blue-200">
                        {officerImages.length} uploaded
                      </span>
                    )}
                  </div>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer shadow-2xs hover:border-[#1e40af] transition-colors">
                    {isUploading
                      ? <><Loader2 size={13} className="animate-spin text-[#1e40af]" /><span>Uploading...</span></>
                      : <><Upload size={13} className="text-[#1e40af]" /><span>Upload Photo</span></>}
                    <input type="file" accept="image/*" onChange={handleUploadImage} disabled={isUploading} className="hidden" />
                  </label>
                </div>

                {officerImages.length === 0 ? (
                  <label className="flex flex-col items-center justify-center gap-3 py-8 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 cursor-pointer hover:border-[#1e40af] hover:bg-blue-50/20 transition-all group">
                    <Camera size={26} className="text-slate-300 group-hover:text-[#1e40af] transition-colors" />
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-400 group-hover:text-[#1e40af] transition-colors">Upload your investigation photos</p>
                      <p className="text-xs text-slate-400 mt-0.5">PNG, JPG up to 5MB • visible to student &amp; admin after saving</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleUploadImage} disabled={isUploading} className="hidden" />
                  </label>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {officerImages.map((img, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 hover:border-[#1e40af] transition-all shadow-2xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt={`Investigation ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button type="button" onClick={() => setZoomImg(img)} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white cursor-pointer transition-colors" title="View full size">
                              <ZoomIn size={14} />
                            </button>
                            <button type="button" onClick={() => handleRemoveOfficerImage(idx)} className="p-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white cursor-pointer transition-colors" title="Remove">
                              <X size={14} />
                            </button>
                          </div>
                          <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded font-mono">#{idx + 1}</span>
                        </div>
                      ))}
                      <label className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-200 aspect-video bg-slate-50 cursor-pointer hover:border-[#1e40af] hover:bg-blue-50/20 transition-all group">
                        {isUploading
                          ? <Loader2 size={18} className="animate-spin text-[#1e40af]" />
                          : <><Upload size={18} className="text-slate-300 group-hover:text-[#1e40af] transition-colors" /><span className="text-[10px] font-bold text-slate-400 group-hover:text-[#1e40af] transition-colors">Add More</span></>}
                        <input type="file" accept="image/*" onChange={handleUploadImage} disabled={isUploading} className="hidden" />
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Images are staged locally. Click <span className="font-bold">Save &amp; Update</span> to save them.
                    </p>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between pt-1 flex-wrap gap-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">* Saves status, findings and investigation photos to the AICTE complaint registry.</span>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0f274a] to-[#1e40af] hover:from-[#0a1c36] hover:to-[#1e3a8a] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? <><Loader2 size={15} className="animate-spin" /><span>Saving...</span></> : <><Save size={15} /><span>Save &amp; Update</span></>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Zoom lightbox */}
      {zoomImg && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setZoomImg(null)}>
          <div className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-4" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setZoomImg(null)} className="absolute top-3 right-3 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors">
              <X size={20} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={zoomImg} alt="Full view" className="max-h-[75vh] w-auto max-w-full mx-auto object-contain rounded-xl mt-6" />
          </div>
        </div>
      )}
    </main>
  );
}
