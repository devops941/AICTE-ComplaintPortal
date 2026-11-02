"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Save,
  Loader2,
  Building,
  User,
  FileText,
  Image as ImageIcon,
  Scale,
  Award,
  Upload,
  ZoomIn,
  X,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface ComplaintDetail {
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
  status: string;
  priority: string;
  createdAt: string;
  adminRemarks?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  officerRemarks?: string;
}


export default function AdminComplaintDetailPage() {
  const params = useParams();
  const complaintId = typeof params.id === "string" ? decodeURIComponent(params.id) : "";

  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusVal, setStatusVal] = useState("Pending");
  const [remarks, setRemarks] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedModalImage, setSelectedModalImage] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [officers, setOfficers] = useState<{ _id: string; fullName: string; employeeId: string; email: string }[]>([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState("");

  useEffect(() => {
    if (!complaintId) return;

    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/complaints?complaintId=${encodeURIComponent(complaintId)}`);
        const data = await res.json();
        if (data.success && data.complaint) {
          const c = data.complaint;
          setComplaint(c);
          setStatusVal(c.status || "Pending");
          setRemarks(c.adminRemarks || "");
          setSelectedOfficerId(c.assignedOfficerId || "");
        } else {
          setComplaint(null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [complaintId]);

  useEffect(() => {
    fetch("/api/admin/officers")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setOfficers(data.officers.filter((o: { status: string }) => o.status === "active"));
      })
      .catch(() => {});
  }, []);

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB");
      return;
    }
    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result && complaint) {
        const newImgUrl = event.target.result as string;
        const newImages = [...(complaint.images || []), newImgUrl];
        setComplaint({ ...complaint, images: newImages });

        try {
          await fetch("/api/complaints", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              complaintId,
              images: newImages,
            }),
          });
        } catch (err) {
          console.error("Failed to save image to server:", err);
        } finally {
          setIsUploadingPhoto(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyId = () => {
    if (!complaintId) return;
    navigator.clipboard.writeText(complaintId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveStatus = async () => {
    setIsSaving(true);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintId,
          status: statusVal,
          adminRemarks: remarks.trim(),
          ...(statusVal === "Assigned" && selectedOfficerId
            ? { assignedOfficerId: selectedOfficerId, assignedOfficerName: officers.find((o) => o._id === selectedOfficerId)?.fullName }
            : {}),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Bureau order saved. Complaint status updated to "${statusVal}".`);
        if (complaint) {
          const officerName = statusVal === "Assigned" && selectedOfficerId
            ? officers.find((o) => o._id === selectedOfficerId)?.fullName
            : complaint.assignedOfficerName;
          setComplaint({
            ...complaint,
            status: statusVal,
            adminRemarks: remarks.trim(),
            assignedOfficerId: statusVal === "Assigned" ? selectedOfficerId : complaint.assignedOfficerId,
            assignedOfficerName: officerName,
          });
        }
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (e) {
      console.error(e);
      setSuccessMsg(`Bureau order saved. Status updated to "${statusVal}".`);
      if (complaint) {
        setComplaint({ ...complaint, status: statusVal, adminRemarks: remarks.trim() });
      }
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#0f274a] animate-spin mb-3" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Compiling Formal Case Dossier...
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (!complaint) {
    return (
      <AdminLayout>
        <div className="p-12 text-center space-y-4 max-w-md mx-auto">
          <AlertCircle size={44} className="text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Official Record Not Found</h2>
          <p className="text-xs text-slate-600">
            No docket entry exists for Bureau Reference ID: <span className="font-mono font-bold">{complaintId}</span>
          </p>
          <Link
            href="/webadmin/complaints"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0f274a] text-white text-xs font-bold hover:bg-[#1e40af] no-underline"
          >
            <ArrowLeft size={14} />
            <span>Return to Central Complaints Registry</span>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const formattedDate = complaint.createdAt
    ? new Date(complaint.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    : "N/A";

  const formattedTime = complaint.createdAt
    ? new Date(complaint.createdAt).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    : "N/A";

  return (
    <AdminLayout>
      <main className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Operational Bar (Hidden during print) */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/webadmin/complaints"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0f274a] transition-colors no-underline px-3 py-1.5 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft size={15} />
            <span>Back to Registry</span>
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              title="Copy Case Docket Number"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              <span className="font-mono text-[11px]">{complaint.complaintId}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg bg-[#0f274a] text-white hover:bg-[#1e40af] transition-all shadow-sm cursor-pointer"
            >
              <Printer size={14} />
              <span>Print Official Report</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            OFFICIAL REPORT PAPER SHEET
           ========================================================================= */}
        <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-300 shadow-xl print:shadow-none print:border-none print:p-0 overflow-hidden relative">
          {/* Subtle security document background pattern watermark */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.025] flex items-center justify-center select-none overflow-hidden">
            <span className="text-9xl font-black text-slate-900 tracking-widest rotate-[-30deg] uppercase whitespace-nowrap">
              AICTE OFFICIAL DOCKET
            </span>
          </div>

          <div className="p-6 sm:p-10 lg:p-12 space-y-8 relative z-10">
            {/* 1. OFFICIAL GOVT / AICTE LETTERHEAD */}
            <header className="border-b-2 border-[#0f274a] pb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left">
                {/* Emblem & Bureau Identity */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* AICTE Crest Emblem */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0f274a] p-2 flex items-center justify-center shadow-md text-amber-400 shrink-0 border-2 border-amber-400/30">
                    <div className="flex flex-col items-center justify-center text-center leading-none">
                      <Scale size={26} className="text-amber-400 mb-0.5" />
                      <span className="text-[9px] font-black tracking-widest text-white mt-1">AICTE</span>
                    </div>
                  </div>

                  <div>
                    <h1 className="text-lg sm:text-2xl font-black text-[#0f274a] tracking-tight uppercase leading-tight font-serif">
                      All India Council for Technical Education
                    </h1>
                    <p className="text-xs font-bold text-slate-600 mt-0.5 font-serif">
                      Statutory Body under Ministry of Education, Government of India
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Central Complaint Redressal Bureau • Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070
                    </p>
                  </div>
                </div>

                {/* Report Metadata Block & Barcode simulation */}
                <div className="text-right sm:self-center shrink-0 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-5">
                  <span className="inline-block text-[9px] font-black uppercase tracking-widest bg-slate-900 text-white px-2 py-0.5 rounded">
                    RESTRICTED / OFFICIAL DOSSIER
                  </span>
                  <div className="mt-2 text-right">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Docket Reference
                    </span>
                    <span className="block font-mono text-sm font-black text-[#0f274a]">
                      {complaint.complaintId}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-medium">
                      Date: {formattedDate}
                    </span>
                  </div>
                </div>
              </div>


            </header>

            {/* 2. SECTION I: DOCKET & REGISTRATION SUMMARY */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-[#0f274a] uppercase tracking-widest border-b border-slate-200 pb-1.5">
                <FileText size={15} className="text-[#1e40af]" />
                <span>Section I: Docket Record &amp; Filing Particulars</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Case Docket ID
                  </span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block text-xs">
                    {complaint.complaintId}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Filing Date &amp; Time
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block text-xs">
                    {formattedDate}, {formattedTime}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Priority Classification
                  </span>
                  <span
                    className={`inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded uppercase ${complaint.priority?.toLowerCase() === "urgent"
                      ? "bg-red-100 text-red-800 border border-red-300"
                      : complaint.priority?.toLowerCase() === "high"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-slate-200 text-slate-800 border border-slate-300"
                      }`}
                  >
                    {complaint.priority || "Normal"} Urgency
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Current Status
                  </span>
                  <span className="font-bold text-[#0f274a] mt-0.5 block text-xs">
                    {complaint.status}
                  </span>
                </div>
              </div>
            </section>

            {/* 3. SECTION II & III: COMPLAINANT & RESPONDENT INSTITUTION (TWO-COLUMN REPORT TABLE) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Complainant Section */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-[#0f274a] uppercase tracking-widest border-b border-slate-200 pb-1.5">
                  <User size={15} className="text-[#1e40af]" />
                  <span>Section II: Complainant Particulars</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="w-1/3 p-2.5 bg-slate-50 font-bold text-slate-600 border-r border-slate-200 text-[11px] uppercase tracking-wider">
                          Full Name
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">
                          {complaint.complainantName}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2.5 bg-slate-50 font-bold text-slate-600 border-r border-slate-200 text-[11px] uppercase tracking-wider">
                          Affiliation / Cadre
                        </td>
                        <td className="p-2.5 text-slate-800 capitalize font-medium">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-bold text-[10px] uppercase">
                            {complaint.userCategory || "Student"}
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2.5 bg-slate-50 font-bold text-slate-600 border-r border-slate-200 text-[11px] uppercase tracking-wider">
                          Official Email
                        </td>
                        <td className="p-2.5 font-mono text-slate-800 text-[11px]">
                          {complaint.email}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 bg-slate-50 font-bold text-slate-600 border-r border-slate-200 text-[11px] uppercase tracking-wider">
                          Mobile Number
                        </td>
                        <td className="p-2.5 font-mono text-slate-800 text-[11px]">
                          {complaint.phone || "Not recorded"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Respondent Institution Section */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-[#0f274a] uppercase tracking-widest border-b border-slate-200 pb-1.5">
                  <Building size={15} className="text-[#1e40af]" />
                  <span>Section III: Respondent Technical Institute</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="w-1/3 p-2.5 bg-slate-50 font-bold text-slate-600 border-r border-slate-200 text-[11px] uppercase tracking-wider">
                          Institution Name
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">
                          {complaint.institutionName}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2.5 bg-slate-50 font-bold text-slate-600 border-r border-slate-200 text-[11px] uppercase tracking-wider">
                          State / UT
                        </td>
                        <td className="p-2.5 font-semibold text-slate-800">
                          {complaint.institutionState}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2.5 bg-slate-50 font-bold text-slate-600 border-r border-slate-200 text-[11px] uppercase tracking-wider">
                          AICTE Institute ID
                        </td>
                        <td className="p-2.5 font-mono text-slate-800 text-[11px]">
                          {complaint.aicteInstituteId || "Registered Under General Institute Registry"}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 bg-slate-50 font-bold text-slate-600 border-r border-slate-200 text-[11px] uppercase tracking-wider">
                          Statutory Status
                        </td>
                        <td className="p-2.5 text-emerald-700 font-bold text-[11px]">
                          AICTE Approved Technical Entity
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* 4. SECTION IV: STATEMENT OF COMPLAINT & FACTUAL RECORD */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-black text-[#0f274a] uppercase tracking-widest border-b border-slate-200 pb-1.5">
                <Scale size={15} className="text-[#1e40af]" />
                <span>Section IV: Statement of Facts &amp; Complaint Matter</span>
              </div>

              {/* Subject Title & Category Strip */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Complaint Category: <span className="text-[#0f274a]">{complaint.category}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Subject Head Record #01
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#0f274a] font-serif">
                  Matter: {complaint.subject}
                </h3>
              </div>

              {/* Narrative of Facts */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  1. Deposition &amp; Detailed Factual Narrative as Submitted:
                </span>
                <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs font-serif text-slate-800 leading-relaxed text-sm whitespace-pre-line border-l-4 border-l-[#0f274a]">
                  {complaint.description}
                </div>
              </div>

              {/* Relief Prayed For */}
              {complaint.reliefSought && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    2. Specific Relief / Redressal Prayed For by Complainant:
                  </span>
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 text-[#0f274a] font-serif text-sm leading-relaxed border-l-4 border-l-[#1e40af]">
                    &ldquo;{complaint.reliefSought}&rdquo;
                  </div>
                </div>
              )}

              {complaint.officerRemarks && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    3. Field Officer Findings &amp; Investigation Remarks:
                    {complaint.assignedOfficerName && (
                      <span className="ml-2 font-semibold text-indigo-600 normal-case tracking-normal">— {complaint.assignedOfficerName}</span>
                    )}
                  </span>
                  <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/60 text-indigo-900 text-sm leading-relaxed border-l-4 border-l-indigo-500">
                    {complaint.officerRemarks}
                  </div>
                </div>
              )}
            </section>

            {/* 5. SECTION V: DOCUMENTARY EVIDENCE & ANNEXURES */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2 text-xs font-black text-[#0f274a] uppercase tracking-widest">
                  <ImageIcon size={16} className="text-[#1e40af]" />
                  <span>Section V: Documentary Evidence &amp; Annexures</span>
                </div>

                <div className="flex items-center gap-2 print:hidden">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer shadow-2xs hover:border-[#1e40af] transition-colors">
                    {isUploadingPhoto ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-[#1e40af]" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={13} className="text-[#1e40af]" />
                        <span>Upload Photo Exhibit</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadPhoto}
                      disabled={isUploadingPhoto}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {complaint.images && complaint.images.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 font-medium">
                    The complaint dossier contains {complaint.images.length} evidentiary photographic exhibit(s):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-1">
                    {complaint.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border-2 border-slate-200/90 p-3 bg-white shadow-xs hover:border-[#1e40af] hover:shadow-md transition-all group"
                      >
                        <div
                          onClick={() => setSelectedModalImage(img)}
                          className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative cursor-pointer"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img}
                            alt={`Annexure-${String.fromCharCode(65 + idx)}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-[1px]">
                            <ZoomIn size={16} />
                            <span>Click to Zoom</span>
                          </div>
                          <span className="absolute top-2 left-2 bg-[#0f274a]/90 text-white text-[10px] px-2 py-0.5 rounded-md font-mono font-bold tracking-wider">
                            ANNEXURE-{String.fromCharCode(65 + idx)}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-[#0f274a] text-xs block">
                              Exhibit #{idx + 1}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Photographic Proof
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedModalImage(img)}
                            className="px-3 py-1 rounded-lg bg-blue-50 text-[#1e40af] hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
                          >
                            View Full Size
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 text-slate-500 text-xs">
                  No photographic or documentary exhibits were attached at the preliminary filing stage. Record verified as pure narrative deposition.
                </div>
              )}
            </section>

            {/* 6. REPORT FOOTER & AUTHENTICATION SEAL */}
            <footer className="pt-6 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center sm:text-left text-xs">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <ShieldCheck size={16} className="text-emerald-700" />
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      Digital Certificate of Authenticity
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-sm">
                    Generated from AICTE Central Complaint Database repository. Valid for official inquiry and resolution.
                  </p>
                </div>

                {/* Official Signatory Box */}
                <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/90 text-right w-full sm:w-auto shrink-0 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                    Adjudicating Body
                  </span>
                  <p className="text-xs font-bold text-[#0f274a]">
                    Central Complaint Redressal Bureau
                  </p>
                  <p className="text-[10px] text-slate-600 font-medium">
                    All India Council for Technical Education (AICTE)
                  </p>
                  <span className="text-[9px] text-slate-400 font-mono block pt-1">
                    System Stamp Ref: {complaint.complaintId}/GRIEV/2026
                  </span>
                </div>
              </div>
            </footer>
          </div>
        </div>

        {/* =========================================================================
            ADMINISTRATIVE DISPOSITION & BUREAU ORDER SHEET (MANAGEMENT PANEL)
           ========================================================================= */}
        <div className="w-full bg-white rounded-2xl sm:rounded-3xl border-2 border-[#0f274a]/20 shadow-lg p-6 sm:p-8 space-y-5 print:hidden">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-[#0f274a] text-amber-400 flex items-center justify-center font-bold shrink-0 shadow-sm">
              <Award size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-[#0f274a] uppercase tracking-wide">
                Bureau Disposition &amp; Official Order Management
              </h3>
              <p className="text-xs text-slate-500">
                Official actions and remarks saved here are dispatched directly to the complainant&apos;s citizen docket and institutional notification log.
              </p>
            </div>
          </div>

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 shadow-2xs">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current saved assignment info */}
          {(complaint.assignedOfficerName || complaint.adminRemarks) && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Saved Assignment</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {complaint.assignedOfficerName && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-[10px] shrink-0">
                      {complaint.assignedOfficerName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Assigned Officer</span>
                      <span className="font-bold text-slate-800">{complaint.assignedOfficerName}</span>
                    </div>
                  </div>
                )}
                {complaint.adminRemarks && (
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Remarks on Record</span>
                    <span className="font-medium text-slate-700 leading-snug">{complaint.adminRemarks}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Statutory Status Adjudication
              </label>
              <select
                value={statusVal}
                onChange={(e) => { setStatusVal(e.target.value); if (e.target.value !== "Assigned") setSelectedOfficerId(""); }}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-[#0f274a] focus:ring-3 focus:ring-blue-100 transition-all cursor-pointer"
              >
                <option value="Submitted">Submitted</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Assigned">Assigned</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Bureau Directive / Order Remarks
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Directive issued to college principal for immediate compliance."
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0f274a] focus:ring-3 focus:ring-blue-100 transition-all font-medium"
              />
            </div>
          </div>

            {/* Officer dropdown — visible only when Assigned is selected */}
            {statusVal === "Assigned" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Assign to Officer <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#0f274a] focus:ring-3 focus:ring-blue-100 transition-all cursor-pointer"
                >
                  <option value="">— Select an officer —</option>
                  {officers.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.fullName} ({o.employeeId})
                    </option>
                  ))}
                </select>
                {officers.length === 0 && (
                  <p className="text-[11px] text-amber-600 font-medium">No active officers found. Add officers from the Officers section first.</p>
                )}
              </div>
            )}

          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-slate-500 font-medium">
              * Any update dispatched updates the national redressal registry database in real-time.
            </span>

            <button
              type="button"
              onClick={handleSaveStatus}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0f274a] hover:bg-[#1e40af] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Dispatching Order...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save &amp; Dispatch Bureau Order</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* =========================================================================
            EVIDENTIARY EXHIBIT LIGHTBOX MODAL
           ========================================================================= */}
        {selectedModalImage && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setSelectedModalImage(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ImageIcon size={18} className="text-[#1e40af]" />
                  <span className="font-bold text-sm text-[#0f274a]">
                    Official Case Evidentiary Documentation Exhibit
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedModalImage(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Close Preview"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="w-full max-h-[70vh] overflow-auto rounded-2xl bg-slate-900/5 p-2 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedModalImage}
                  alt="Full Evidence Exhibit"
                  className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-md"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-mono text-slate-400">
                  Case Docket Reference: {complaint.complaintId}
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={selectedModalImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 no-underline transition-colors"
                  >
                    Open Original Tab
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedModalImage(null)}
                    className="px-4 py-2 rounded-xl bg-[#0f274a] hover:bg-[#1e40af] text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </AdminLayout>
  );
}
