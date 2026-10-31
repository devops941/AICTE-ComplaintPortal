"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, Eye, RefreshCw } from "lucide-react";
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


export default function WebAdminComplaintsPage() {
  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  const fetchComplaints = async () => {
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
    fetchComplaints();
  }, []);

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

  const filteredComplaints = complaints.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      c.complaintId.toLowerCase().includes(q) ||
      c.complainantName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.institutionName.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "All" ||
      c.status?.toLowerCase() === statusFilter.toLowerCase() ||
      (statusFilter === "Submitted" && c.status === "Pending") ||
      (statusFilter === "Confirmed" &&
        (c.status === "Under Review" || c.status === "In Review" || c.status === "Under Scrutiny"));

    const matchesPriority = priorityFilter === "All" || c.priority === priorityFilter;

    return matchesQuery && matchesStatus && matchesPriority;
  });

  return (
    <AdminLayout>
      <main className="p-4 sm:p-8 w-full space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0f274a] tracking-tight">
              Central Complaints Registry
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Click Manage on any complaint to open its separate dedicated details page.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchComplaints}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
              title="Refresh Registry"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin text-[#1e40af]" : ""} />
            </button>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 text-[#1e40af] border border-blue-200 text-xs font-bold">
              <span>Total Records: {filteredComplaints.length}</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, name, email, college, subject..."
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1e40af] focus:ring-3 focus:ring-blue-100 transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
            {(["All", "Submitted", "Confirmed", "Assigned", "Resolved", "Closed"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#0f274a] text-white shadow-2xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {st}
              </button>
            ))}

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#1e40af]"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
            </select>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
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
                        <RefreshCw className="w-6 h-6 text-[#1e40af] animate-spin" />
                        <span className="text-xs font-semibold text-slate-400">Loading complaints...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-sm font-semibold">
                      {complaints.length === 0 ? "No complaints registered yet." : "No complaints matching your search filters."}
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((c) => (
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-[#1e40af] text-[#1e40af] hover:text-white font-bold text-xs transition-colors no-underline"
                        >
                          <Eye size={13} />
                          <span>Manage</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}

