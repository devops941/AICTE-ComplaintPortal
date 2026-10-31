"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon, Mail, Phone, KeyRound, Eye, EyeOff, Save,
  Loader2, ShieldCheck, AlertCircle, CheckCircle2, Info, Lock, Calendar, UserCheck,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<{ id?: string; fullName?: string; email?: string; phone?: string; userCategory?: string; createdAt?: string } | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<"student" | "faculty">("student");
  const [memberSince, setMemberSince] = useState("");

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("complaint_user");
    if (!raw) { router.push("/login?redirect=/dashboard/profile"); return; }
    try {
      const parsed = JSON.parse(raw);
      setUser(parsed);
      setFullName(parsed.fullName || "");
      setEmail(parsed.email || "");
      setPhone(parsed.phone || "");
      setCategory(parsed.userCategory === "faculty" ? "faculty" : "student");
      if (parsed.createdAt) {
        setMemberSince(new Date(parsed.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }));
      }

      fetch(`/api/user/profile?id=${parsed.id || parsed._id || ""}&email=${encodeURIComponent(parsed.email || "")}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setUser(data.user);
            setFullName(data.user.fullName || "");
            setEmail(data.user.email || "");
            setPhone(data.user.phone || "");
            setCategory(data.user.userCategory === "faculty" ? "faculty" : "student");
            if (data.user.createdAt) {
              setMemberSince(new Date(data.user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }));
            }
            localStorage.setItem("complaint_user", JSON.stringify(data.user));
          }
        })
        .catch(() => { /* ignore */ });
    } catch { router.push("/login?redirect=/dashboard/profile"); }
  }, [router]);

  const initials = user?.fullName
    ? user.fullName.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("")
    : "U";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!fullName.trim() || !email.trim()) { setError("Full Name and Email Address are mandatory."); return; }
    if (showPasswordChange && newPassword) {
      if (!currentPassword) { setError("Please enter your current password to set a new password."); return; }
      if (newPassword !== confirmPassword) { setError("New passwords do not match. Please verify."); return; }
      if (newPassword.length < 6) { setError("New password must be at least 6 characters long."); return; }
    }

    setIsSaving(true);
    try {
      const payload: Record<string, string> = {
        id: user?.id || "",
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        userCategory: category,
      };
      if (showPasswordChange && newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) { setError(data.error || "Failed to update profile details."); setIsSaving(false); return; }

      localStorage.setItem("complaint_user", JSON.stringify(data.user));
      setUser(data.user);
      window.dispatchEvent(new Event("user-auth-change"));
      setSuccess("Profile details updated successfully!");
      setIsSaving(false);

      if (newPassword) {
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setShowPasswordChange(false);
      }
    } catch {
      setError("Network error. Could not connect to the server.");
      setIsSaving(false);
    }
  };

  return (
    <main className="p-4 sm:p-8 w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#1e40af] text-[11px] font-bold uppercase tracking-wider mb-1.5 shadow-2xs">
            <UserCheck size={13} className="text-emerald-600" />
            <span>Verified Citizen &amp; Student Credentials</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0f274a] tracking-tight">My Profile &amp; Account Settings</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Manage your personal details, verified contact information, and security preferences.</p>
        </div>
        <button type="button" onClick={() => router.push("/dashboard")} className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer">
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col items-center text-center">
            <div className="w-22 h-22 rounded-full bg-gradient-to-tr from-[#0f274a] to-[#1e40af] text-white flex items-center justify-center text-3xl font-black shadow-md border-4 border-white mb-3">{initials}</div>
            <h2 className="text-lg font-black text-[#0f274a] leading-tight">{user?.fullName || "User Account"}</h2>
            <p className="text-xs text-slate-500 font-medium mt-1 break-all">{user?.email}</p>
            <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-[#1e40af] border border-blue-200">
              <ShieldCheck size={13} />
              <span>{category === "faculty" ? "Faculty / Staff" : "Student"}</span>
            </div>
            <div className="w-full mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2.5 text-left text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-500"><ShieldCheck size={14} className="text-emerald-600" />Account Status</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">Active</span>
              </div>
              {memberSince && (
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 text-slate-500"><Calendar size={14} className="text-slate-400" />Registered</span>
                  <span className="font-semibold text-slate-700">{memberSince}</span>
                </div>
              )}
            </div>
          </div>
          <div className="bg-blue-50/60 rounded-2xl border border-blue-100 p-4 text-xs text-slate-600 leading-relaxed">
            <h3 className="font-bold text-[#0f274a] mb-1 flex items-center gap-1.5"><Info size={14} className="text-[#1e40af]" />Communication Integrity</h3>
            <p className="text-[11px] text-slate-600">AICTE sends hearing notices, inquiry status, and Ombudsman redressal rulings directly to your verified email and phone number.</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
            <h2 className="text-base font-bold text-[#0f274a] pb-3 border-b border-slate-100 mb-5">Edit Personal &amp; Contact Information</h2>

            {error && (
              <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                <span className="font-medium">{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                <span className="font-semibold">{success}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><UserIcon size={15} /></div>
                  <input type="text" required disabled={isSaving} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Vasanthakumar" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all shadow-2xs disabled:bg-slate-100" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Mail size={15} /></div>
                    <input type="email" required disabled={isSaving} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@domain.com" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all shadow-2xs disabled:bg-slate-100" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Phone / Mobile Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Phone size={15} /></div>
                    <input type="tel" disabled={isSaving} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all shadow-2xs disabled:bg-slate-100" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">User Category</label>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    <Lock size={11} className="text-slate-400" /><span>Cannot be edited</span>
                  </span>
                </div>
                <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-sm font-bold text-slate-700 flex items-center justify-between cursor-not-allowed select-none">
                  <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#1e40af]" /><span>{category === "faculty" ? "Faculty / Staff" : "Student"}</span></div>
                  <span className="text-[11px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">Official Category</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5"><Info size={13} className="shrink-0 text-slate-400" /><span>Statutory category assigned during registration and cannot be modified.</span></p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowPasswordChange(!showPasswordChange)} className="flex items-center gap-2 text-xs font-bold text-[#1e40af] hover:text-[#0f274a] transition-colors py-2 cursor-pointer">
                  <KeyRound size={14} /><span>{showPasswordChange ? "Hide Password Change" : "Change Password (Optional)"}</span>
                </button>
                {showPasswordChange && (
                  <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Current Password</label>
                      <div className="relative">
                        <input type={showCurrentPass ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#1e40af] focus:outline-none" />
                        <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showCurrentPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">New Password</label>
                        <div className="relative">
                          <input type={showNewPass ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#1e40af] focus:outline-none" />
                          <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-type new password" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#1e40af] focus:outline-none" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end">
                <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-900/15 hover:shadow-lg transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSaving ? <><Loader2 size={16} className="animate-spin" /><span>Saving Changes...</span></> : <><Save size={16} /><span>Save Changes</span></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
