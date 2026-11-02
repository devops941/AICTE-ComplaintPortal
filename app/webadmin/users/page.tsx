"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  X,
  Mail,
  Phone,
  ChevronRight,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  userCategory: string;
  createdAt: string;
}

interface AdminComplaint {
  complaintId: string;
  email: string;
}



export default function WebAdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsersData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && Array.isArray(data.users) && data.users.length > 0) {
        setUsers(data.users);
      }

      const compRes = await fetch("/api/complaints?all=true");
      const compData = await compRes.json();
      if (compData.success && Array.isArray(compData.complaints)) {
        setComplaints(compData.complaints);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q));

    const matchesCategory =
      categoryFilter === "All" ||
      u.userCategory?.toLowerCase() === categoryFilter.toLowerCase();

    return matchesQuery && matchesCategory;
  });

  return (
    <AdminLayout>
      <main className="p-4 sm:p-8 w-full space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0f274a] tracking-tight">
              Registered Complainants &amp; Users Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Official records of students, faculty, and citizens registered across the AICTE Portal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchUsersData}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
              title="Refresh Directory"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin text-[#1e40af]" : ""} />
            </button>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <span>Total Users: {filteredUsers.length}</span>
            </div>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or phone..."
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

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Role:</span>
            {["All", "Student", "Faculty"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter.toLowerCase() === cat.toLowerCase()
                    ? "bg-[#0f274a] text-white shadow-2xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-6">Name</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">Phone Number</th>
                  <th className="py-3.5 px-6">Role / Category</th>
                  <th className="py-3.5 px-6">Registration Date</th>
                  <th className="py-3.5 px-6 text-right">Complaints Logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No users matching your search filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const userComplaints = complaints.filter(
                      (c) => c.email.toLowerCase() === u.email.toLowerCase()
                    );
                    return (
                      <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-800 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-[#1e40af] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {u.fullName ? u.fullName.slice(0, 2).toUpperCase() : "U"}
                          </div>
                          <span>{u.fullName}</span>
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-slate-600">
                          {u.email}
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {u.phone || "Not set"}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#1e40af] border border-blue-200 capitalize">
                            {u.userCategory || "Student"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-500 text-xs">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "2026"}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            href="/webadmin/complaints"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#1e40af] hover:text-white font-bold text-xs transition-colors no-underline text-slate-700"
                          >
                            <span>{userComplaints.length} Filed</span>
                            <ChevronRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}

