"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  LogOut,
  Calendar,
  KeyRound,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  userCategory: "student" | "faculty";
  createdAt?: string;
}

export default function ProfilePage() {
  const router = useRouter();

  // User details state
  const [userId, setUserId] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [userCategory, setUserCategory] = useState<"student" | "faculty">("student");
  const [memberSince, setMemberSince] = useState("");

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Status flags
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Load user data on mount
  useEffect(() => {
    const rawUser = localStorage.getItem("complaint_user");
    if (!rawUser) {
      router.push("/login");
      return;
    }

    try {
      const parsed = JSON.parse(rawUser);
      setUserId(parsed.id || parsed._id || "");
      setFullName(parsed.fullName || "");
      setEmail(parsed.email || "");
      setPhone(parsed.phone || "");
      setUserCategory(parsed.userCategory === "faculty" ? "faculty" : "student");
      if (parsed.createdAt) {
        setMemberSince(new Date(parsed.createdAt).toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        }));
      }

      // Fetch fresh data from backend
      fetch(`/api/user/profile?id=${parsed.id || parsed._id || ""}&email=${encodeURIComponent(parsed.email || "")}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setUserId(data.user.id);
            setFullName(data.user.fullName);
            setEmail(data.user.email);
            setPhone(data.user.phone || "");
            setUserCategory(data.user.userCategory === "faculty" ? "faculty" : "student");
            if (data.user.createdAt) {
              setMemberSince(new Date(data.user.createdAt).toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              }));
            }
            // Update storage with fresh copy
            localStorage.setItem("complaint_user", JSON.stringify(data.user));
          }
        })
        .catch((err) => console.error("Error refreshing profile:", err))
        .finally(() => {
          setIsPageLoading(false);
        });
    } catch {
      router.push("/login");
    }
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem("complaint_user");
    localStorage.removeItem("complaint_remember");
    window.dispatchEvent(new Event("user-auth-change"));
    router.push("/");
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!fullName.trim() || !email.trim()) {
      setErrorMsg("Full Name and Email Address are mandatory.");
      return;
    }

    if (showPasswordChange && newPassword) {
      if (!currentPassword) {
        setErrorMsg("Please enter your current password to set a new password.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg("New passwords do not match. Please verify.");
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg("New password must be at least 6 characters long.");
        return;
      }
    }

    setIsSaving(true);

    try {
      const payload: Record<string, any> = {
        id: userId,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        userCategory,
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

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to update profile details.");
        setIsSaving(false);
        return;
      }

      // Update localStorage
      localStorage.setItem("complaint_user", JSON.stringify(data.user));
      // Notify header and other listeners
      window.dispatchEvent(new Event("user-auth-change"));

      setSuccessMsg("Profile details updated successfully!");
      setIsSaving(false);

      // Reset password fields if updated
      if (newPassword) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordChange(false);
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg("Network error. Could not connect to the server.");
      setIsSaving(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-[#1e40af] animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading your profile details...</p>
      </div>
    );
  }

  // Initials for avatar
  const initials = fullName
    ? fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join("")
    : "U";

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 font-sans">
      {/* Top Header Bar */}
      <div className="w-full bg-[#0f274a] text-slate-300 text-xs px-6 sm:px-10 lg:px-14 py-2.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">Government of India</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">Ministry of Education</span>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-white transition-colors no-underline font-semibold"
        >
          <ArrowLeft size={14} />
          <span>Back to Main Portal</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 lg:py-12">
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 shrink-0 flex items-center justify-center">
              <Image
                src="/images/logo.png"
                alt="AICTE Official Seal"
                width={48}
                height={48}
                className="w-full h-full object-contain drop-shadow-xs"
                priority
              />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#1e40af] uppercase tracking-wider block">
                Centralized Institution Portal
              </span>
              <h1 className="text-2xl font-black text-[#0f274a] tracking-tight">
                My Profile &amp; Account Settings
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Layout: Sidebar card + Edit Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#0f274a] to-[#1e40af] text-white flex items-center justify-center text-3xl font-black shadow-md border-4 border-white mb-4">
                {initials}
              </div>

              <h2 className="text-lg font-black text-[#0f274a] leading-tight">
                {fullName || "User Account"}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1 break-all">
                {email}
              </p>

              {/* Category Badge */}
              <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-[#1e40af] border border-blue-200">
                <ShieldCheck size={13} />
                <span>{userCategory === "faculty" ? "Faculty / Staff" : "Student"}</span>
              </div>

              {/* Status Meta */}
              <div className="w-full mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2.5 text-left text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    Account Status
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    Active
                  </span>
                </div>

                {memberSince && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Calendar size={14} className="text-slate-400" />
                      Registered
                    </span>
                    <span className="font-semibold text-slate-700">
                      {memberSince}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Helper Box */}
            <div className="bg-gradient-to-br from-blue-50/60 to-slate-50 rounded-2xl border border-blue-100 p-5 text-xs text-slate-600 leading-relaxed">
              <h3 className="font-bold text-[#0f274a] mb-1.5 flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-[#1e40af]" />
                Identity Security
              </h3>
              <p className="text-slate-600">
                Keeping your contact details accurate ensures timely notifications regarding your registered complaints, status hearings, and AICTE Ombudsman inquiries.
              </p>
            </div>
          </div>

          {/* Right Column: Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h2 className="text-base font-bold text-[#0f274a] pb-3 border-b border-slate-100 mb-6">
                Edit Personal &amp; Contact Information
              </h2>

              {/* Feedback Alerts */}
              {errorMsg && (
                <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs animate-shake">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                  <span className="font-medium">{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                  <span className="font-semibold">{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveChanges} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User size={15} />
                    </div>
                    <input
                      type="text"
                      required
                      disabled={isSaving}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Ramesh Kumar"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all shadow-xs disabled:bg-slate-100"
                    />
                  </div>
                </div>

                {/* Email Address & Mobile Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail size={15} />
                      </div>
                      <input
                        type="email"
                        required
                        disabled={isSaving}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@domain.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all shadow-xs disabled:bg-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Phone / Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone size={15} />
                      </div>
                      <input
                        type="tel"
                        disabled={isSaving}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all shadow-xs disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                </div>

                {/* User Category (Read-only, Locked with Info indicator) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      User Category
                    </label>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      <Lock size={11} className="text-slate-400" />
                      <span>Cannot be edited</span>
                    </span>
                  </div>

                  <div className="relative">
                    <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-sm font-bold text-slate-700 flex items-center justify-between cursor-not-allowed select-none">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-[#1e40af]" />
                        <span>{userCategory === "faculty" ? "Faculty / Staff" : "Student"}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Official Category
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                    <Info size={13} className="shrink-0 text-slate-400" />
                    <span>Statutory category assigned during registration and cannot be modified.</span>
                  </p>
                </div>

                {/* Optional Change Password Accordion */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    className="flex items-center gap-2 text-xs font-bold text-[#1e40af] hover:text-[#0f274a] transition-colors py-2 cursor-pointer"
                  >
                    <KeyRound size={14} />
                    <span>
                      {showPasswordChange ? "Hide Password Change" : "Change Password (Optional)"}
                    </span>
                  </button>

                  {showPasswordChange && (
                    <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5 animate-fadeIn">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPass ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#1e40af] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showCurrentPass ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPass ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Minimum 6 characters"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#1e40af] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPass(!showNewPass)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-type new password"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#1e40af] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-900/10 hover:shadow-lg transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

