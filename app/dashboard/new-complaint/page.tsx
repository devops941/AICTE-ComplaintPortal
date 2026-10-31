"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FilePlus2, Building, MapPin, AlertCircle, ShieldCheck,
  Upload, Trash2, Loader2,
} from "lucide-react";

const INDIAN_STATES = [
  "Andaman and Nicobar Islands","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar",
  "Chandigarh","Chhattisgarh","Dadra and Nagar Haveli and Daman and Diu","Delhi (NCT)",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka",
  "Kerala","Ladakh","Lakshadweep","Madhya Pradesh","Maharashtra","Manipur","Meghalaya",
  "Mizoram","Nagaland","Odisha","Puducherry","Punjab","Rajasthan","Sikkim","Tamil Nadu",
  "Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
];

const COMPLAINT_CATEGORIES = [
  "Academic & Examination Injustice",
  "Fee Irregularities & Withholding Refund",
  "Ragging, Discrimination & Harassment",
  "Denial or Retention of Original Certificates",
  "Faculty Salary, Workload & Service Matters",
  "Inadequate Infrastructure / Lab Facilities",
  "Admission Irregularities & AICTE Norm Violation",
  "Other Institution & Administrative Issues",
];

export default function NewComplaintPage() {
  const router = useRouter();

  const [user, setUser] = useState<{ id?: string; fullName?: string; email?: string; phone?: string; userCategory?: string } | null>(null);

  const [institutionName, setInstitutionName] = useState("");
  const [institutionState, setInstitutionState] = useState("");
  const [aicteId, setAicteId] = useState("");
  const [category, setCategory] = useState(COMPLAINT_CATEGORIES[0]);
  const [priority, setPriority] = useState<"Normal" | "High" | "Urgent">("Normal");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [reliefSought, setReliefSought] = useState("");
  const [agree, setAgree] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("complaint_user");
    if (!raw) { router.push("/login?redirect=/dashboard/new-complaint"); return; }
    try { setUser(JSON.parse(raw)); } catch { router.push("/login?redirect=/dashboard/new-complaint"); }
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) { alert("Please upload image files only"); return; }
      if (file.size > 5 * 1024 * 1024) { alert("Image must be smaller than 5MB"); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setImages((prev) => [...prev, ev.target!.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!agree) { setError("Please accept the statutory declaration before submitting."); return; }
    if (!institutionName.trim() || !institutionState) { setError("Please specify the institution name and State/UT."); return; }
    if (!subject.trim() || !description.trim()) { setError("Please provide both complaint subject and detailed description."); return; }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          complainantName: user?.fullName,
          email: user?.email,
          phone: user?.phone,
          userCategory: user?.userCategory || "student",
          institutionName: institutionName.trim(),
          institutionState,
          aicteInstituteId: aicteId.trim(),
          category,
          subject: subject.trim(),
          description: description.trim(),
          reliefSought: reliefSought.trim(),
          priority,
          images,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setError(data.error || "Failed to submit complaint."); setIsSubmitting(false); return; }

      const notif = {
        id: `notif-${Date.now()}`,
        title: "Complaint Submitted Successfully",
        message: `Your complaint "${subject.trim()}" has been submitted. Official Complaint ID: ${data.complaintId}.`,
        date: "Just now",
        complaintId: data.complaintId,
        type: "success",
        read: false,
      };
      try {
        const existing = JSON.parse(localStorage.getItem("complaint_notifications") || "[]");
        localStorage.setItem("complaint_notifications", JSON.stringify([notif, ...existing]));
      } catch { /* ignore */ }

      setIsSubmitting(false);
      router.push("/dashboard/my-complaints");
    } catch {
      setError("Network error. Could not connect to AICTE complaint server.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="p-4 sm:p-8 w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0f274a] tracking-tight">New Complaint</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Submit your complaint directly to AICTE officials for quick resolution.</p>
        </div>
        <button type="button" onClick={() => router.push("/dashboard")} className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer">
          Back to Dashboard
        </button>
      </div>

      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#0f274a] via-[#1e40af] to-sky-500" />
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/70 via-white to-blue-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-[#1e40af] flex items-center justify-center shrink-0 border border-blue-200/50 shadow-2xs">
              <FilePlus2 size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0f274a] tracking-tight">Complaint Registration Form</h2>
              <p className="text-xs text-slate-500 font-medium">Fields marked with <span className="text-red-500 font-bold">*</span> are required.</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold shadow-2xs">
            <ShieldCheck size={14} className="text-emerald-600" />
            Official Redressal Portal
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm">
              <AlertCircle size={17} className="shrink-0 mt-0.5 text-red-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">College / Institute Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Building size={16} /></div>
                <input type="text" required disabled={isSubmitting} value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} placeholder="Enter your college or institute name" className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1e40af] focus:ring-3 focus:ring-blue-100 transition-all font-medium disabled:bg-slate-100" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">State <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><MapPin size={16} /></div>
                <select required disabled={isSubmitting} value={institutionState} onChange={(e) => setInstitutionState(e.target.value)} className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#1e40af] focus:ring-3 focus:ring-blue-100 transition-all font-medium disabled:bg-slate-100">
                  <option value="">-- Select State --</option>
                  {INDIAN_STATES.map((st) => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">College AICTE ID <span className="text-slate-400 font-normal lowercase">(optional)</span></label>
              <input type="text" disabled={isSubmitting} value={aicteId} onChange={(e) => setAicteId(e.target.value)} placeholder="e.g. 1-123456789" className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1e40af] focus:ring-3 focus:ring-blue-100 transition-all font-medium disabled:bg-slate-100" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Complaint Category <span className="text-red-500">*</span></label>
              <select required disabled={isSubmitting} value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#1e40af] focus:ring-3 focus:ring-blue-100 transition-all font-medium disabled:bg-slate-100">
                {COMPLAINT_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Subject / Title <span className="text-red-500">*</span></label>
              <input type="text" required disabled={isSubmitting} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Short summary of your complaint" className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1e40af] focus:ring-3 focus:ring-blue-100 transition-all font-medium disabled:bg-slate-100" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Priority Level</label>
              <div className="grid grid-cols-3 gap-1.5 h-10 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                {(["Normal", "High", "Urgent"] as const).map((p) => (
                  <button key={p} type="button" onClick={() => setPriority(p)} className={`h-full rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${priority === p ? (p === "Urgent" ? "bg-red-600 text-white shadow-xs" : p === "High" ? "bg-amber-600 text-white shadow-xs" : "bg-[#1e40af] text-white shadow-xs") : "text-slate-600 hover:text-slate-900 hover:bg-white/60"}`}>{p}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Complaint Description <span className="text-red-500">*</span></label>
              <textarea rows={4} required disabled={isSubmitting} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Explain what happened in detail, including dates, facts, and people involved..." className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1e40af] focus:ring-3 focus:ring-blue-100 transition-all leading-relaxed font-normal resize-none disabled:bg-slate-100" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">What solution do you want? <span className="text-slate-400 font-normal lowercase">(optional)</span></label>
              <textarea rows={4} disabled={isSubmitting} value={reliefSought} onChange={(e) => setReliefSought(e.target.value)} placeholder="What action should be taken to resolve this?" className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1e40af] focus:ring-3 focus:ring-blue-100 transition-all leading-relaxed font-normal resize-none disabled:bg-slate-100" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Upload size={14} className="text-[#1e40af]" />
                Attach Photos or Documents <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              {images.length > 0 && <span className="text-[11px] font-bold text-[#1e40af] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">{images.length} photo{images.length === 1 ? "" : "s"} selected</span>}
            </div>
            <label className="border-2 border-dashed border-slate-200 hover:border-[#1e40af] rounded-xl px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer transition-all bg-slate-50/60 hover:bg-blue-50/30 group">
              <input type="file" accept="image/*" multiple onChange={handleImageChange} disabled={isSubmitting} className="hidden" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-[#1e40af] group-hover:scale-105 flex items-center justify-center transition-transform shrink-0 shadow-2xs"><Upload size={18} /></div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-700 group-hover:text-[#1e40af] transition-colors">Click to upload photos or receipts</p>
                  <p className="text-[11px] text-slate-400">Supports PNG, JPG, JPEG up to 5MB</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 group-hover:border-blue-300 shadow-2xs transition-all">Browse Files</span>
            </label>
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100 shadow-2xs hover:shadow-xs transition-shadow">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md transition-all cursor-pointer opacity-90 hover:opacity-100"><Trash2 size={12} /></button>
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded-md font-mono">#{idx + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" required checked={agree} onChange={(e) => setAgree(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-[#1e40af] focus:ring-[#1e40af] cursor-pointer" />
              <span className="text-xs sm:text-sm text-slate-700 font-medium select-none">I confirm that all the information provided above is true and correct.</span>
            </label>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button type="button" onClick={() => { setInstitutionName(""); setInstitutionState(""); setAicteId(""); setSubject(""); setDescription(""); setReliefSought(""); setImages([]); setAgree(false); }} className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer">Clear</button>
              <button type="submit" disabled={isSubmitting} className="w-1/2 sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0f274a] to-[#1e40af] hover:from-[#0a1c36] hover:to-[#1e3a8a] text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                {isSubmitting ? <><Loader2 size={15} className="animate-spin" /><span>Submitting...</span></> : <><FilePlus2 size={15} /><span>Submit Complaint</span></>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
