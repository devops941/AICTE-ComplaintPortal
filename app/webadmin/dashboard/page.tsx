"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  RefreshCw,
  Eye,
  ArrowRight,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface AdminComplaint {
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
  status: string;
  priority: string;
  createdAt: string;
}

export default function WebAdminDashboardPage() {
  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/complaints?all=true");
      const data = await res.json();
      if (data.success && Array.isArray(data.complaints)) {
        setComplaints(data.complaints);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalCount = complaints.length;
  const submittedCount = complaints.filter(
    (c) => c.status === "Submitted" || c.status === "Pending"
  ).length;
  const confirmedOrAssignedCount = complaints.filter(
    (c) =>
      c.status === "Confirmed" ||
      c.status === "Assigned" ||
      c.status === "Under Review" ||
      c.status === "In Review" ||
      c.status === "Under Scrutiny"
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === "Resolved" || c.status === "Closed"
  ).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Submitted":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "Confirmed":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Assigned":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "Resolved":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Closed":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "Pending":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "Under Review":
      case "In Review":
      case "Under Scrutiny":
        return "bg-amber-50 text-amber-800 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "Urgent":
        return "bg-red-50 text-red-700 border-red-200 font-bold";
      case "High":
        return "bg-amber-50 text-amber-700 border-amber-200 font-bold";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <AdminLayout>
      <main className="p-4 sm:p-8 w-full space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0f274a] tracking-tight">
              Admin Overview &amp; Control
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Central authority view over complaints across all Indian colleges, institutes, and students.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin text-[#1e40af]" : ""} />
            </button>
            <Link
              href="/webadmin/complaints"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0f274a] to-[#1e40af] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all no-underline"
            >
              <span>Manage All Complaints</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {/* Card 1: Total */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1e40af] flex items-center justify-center border border-blue-200/60 shadow-2xs">
                <FileText size={22} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block">Total Complaints</span>
                <span className="text-2xl font-black text-[#0f274a]">{totalCount}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1e40af]">
              Registry
            </span>
          </div>

          {/* Card 2: Submitted */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60 shadow-2xs">
                <Clock size={22} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block">Submitted</span>
                <span className="text-2xl font-black text-[#0f274a]">{submittedCount}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              New
            </span>
          </div>

          {/* Card 3: Confirmed / Assigned */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60 shadow-2xs">
                <RefreshCw size={22} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block">Confirmed / Assigned</span>
                <span className="text-2xl font-black text-[#0f274a]">{confirmedOrAssignedCount}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
              Active
            </span>
          </div>

          {/* Card 4: Resolved */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60 shadow-2xs">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block">Redressed / Closed</span>
                <span className="text-2xl font-black text-[#0f274a]">{resolvedCount}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              Completed
            </span>
          </div>
        </div>

        {/* Recent Central Complaints Registry Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0f274a]">
                Recent Central Complaints Registry
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Click Manage on any complaint to open its full dedicated details page
              </p>
            </div>
            <Link
              href="/webadmin/complaints"
              className="text-xs font-bold text-[#1e40af] hover:underline no-underline"
            >
              View All ({complaints.length}) →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-6">Complaint ID</th>
                  <th className="py-3 px-6">Complainant</th>
                  <th className="py-3 px-6">College / Institute</th>
                  <th className="py-3 px-6">Subject / Title</th>
                  <th className="py-3 px-6">Priority</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-6 h-6 text-[#1e40af] animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                        <span className="text-xs font-semibold text-slate-400">Loading complaints...</span>
                      </div>
                    </td>
                  </tr>
                ) : complaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-sm font-semibold">No complaints registered yet.</td>
                  </tr>
                ) : complaints.slice(0, 8).map((c) => (
                  <tr key={c.complaintId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-[#1e40af] text-xs">
                      {c.complaintId}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-slate-800 block">{c.complainantName}</span>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[150px]">
                        {c.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-medium text-slate-700 block max-w-[200px] truncate">
                        {c.institutionName}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{c.institutionState}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-slate-800 block max-w-[200px] truncate">
                        {c.subject}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate max-w-[200px]">
                        {c.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] border ${getPriorityBadge(
                          c.priority
                        )}`}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-2xs ${getStatusBadge(
                          c.status
                        )}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        href={`/webadmin/complaints/${encodeURIComponent(c.complaintId)}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-[#1e40af] text-[#1e40af] hover:text-white font-bold text-xs transition-colors no-underline"
                      >
                        <Eye size={13} />
                        <span>Manage</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}

