"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  UserCog, Plus, Search, X, RefreshCw, Shield,
  Trash2, Eye, EyeOff, AlertTriangle,
} from "lucide-react";

interface Officer {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  employeeId: string;
  status: "active" | "inactive";
  createdAt: string;
}

const EMPTY_FORM = { fullName: "", email: "", phone: "", employeeId: "", password: "" };

export default function OfficersPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Officer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOfficers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/officers");
      const data = await res.json();
      if (data.success) setOfficers(data.officers);
    } catch { /* ignore */ } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchOfficers(); }, []);

  const handleCreate = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setFormError("");
    if (!form.fullName || !form.email || !form.employeeId || !form.password) {
      setFormError("Please fill all required fields."); return;
    }
    if (form.password.length < 6) { setFormError("Password must be at least 6 characters."); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/officers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setForm(EMPTY_FORM);
        fetchOfficers();
      } else {
        setFormError(data.error || "Failed to create officer.");
      }
    } catch { setFormError("Network error. Please try again."); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/admin/officers?officerId=${deleteTarget._id}`, { method: "DELETE" });
      setDeleteTarget(null);
      fetchOfficers();
    } catch { /* ignore */ } finally { setIsDeleting(false); }
  };

  const filtered = officers.filter((o) => {
    const q = searchQuery.toLowerCase();
    return !q || o.fullName.toLowerCase().includes(q) || o.email.toLowerCase().includes(q) || o.employeeId.toLowerCase().includes(q);
  });

  const activeCount = officers.filter((o) => o.status === "active").length;

  return (
    <AdminLayout>
      <main className="p-4 sm:p-8 w-full space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0f274a] tracking-tight">Officers Management</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Create and manage AICTE complaint handling officers.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
              <Shield size={13} />
              <span>{activeCount} Active</span>
            </div>
            <button
              type="button"
              onClick={fetchOfficers}
              disabled={isLoading}
              title="Refresh"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer transition-colors"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin text-[#1e40af]" : ""} />
            </button>
            <button
              type="button"
              onClick={() => { setShowCreateModal(true); setFormError(""); setForm(EMPTY_FORM); setShowPassword(false); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-700 to-[#1e40af] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Create Officer</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="relative w-full md:w-96">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email or employee ID..."
              className="w-full h-10 pl-9 pr-9 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1e40af] focus:ring-2 focus:ring-blue-100 transition-all"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Officers Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-6">Officer</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Phone</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Joined</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <UserCog size={38} className="text-slate-300" />
                        <p className="text-sm font-bold text-slate-400">
                          {searchQuery ? "No officers match your search" : "No officers yet"}
                        </p>
                        {!searchQuery && (
                          <button
                            type="button"
                            onClick={() => { setShowCreateModal(true); setFormError(""); setForm(EMPTY_FORM); setShowPassword(false); }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold cursor-pointer hover:bg-indigo-100 transition-colors"
                          >
                            <Plus size={13} /> Create First Officer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0">
                            {o.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block">{o.fullName}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{o.employeeId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-600">{o.email}</td>
                      <td className="py-4 px-6 text-slate-500 text-xs">{o.phone || "—"}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${o.status === "active" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${o.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {o.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-xs">
                        {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(o)}
                            title="Delete officer"
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-400 font-medium">
              Showing {filtered.length} of {officers.length} officers
            </div>
          )}
        </div>
      </main>

      {/* Create Officer Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                  <UserCog size={16} />
                </div>
                <h2 className="text-base font-black text-[#0f274a]">Create New Officer Account</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {formError && (
                <div className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                    placeholder="Officer full name"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1e40af] focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">
                    Employee ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.employeeId}
                    onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
                    placeholder="e.g. AICTE-OFF-001"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-mono placeholder:text-slate-400 focus:outline-none focus:border-[#1e40af] focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="officer@aicte-india.org"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1e40af] focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="10-digit number"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1e40af] focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Min. 6 characters"
                    className="w-full h-10 px-3 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1e40af] focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-700 to-[#1e40af] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <><RefreshCw size={13} className="animate-spin" /> Creating...</>
                  ) : (
                    <><UserCog size={13} /> Create Officer</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500">
                <AlertTriangle size={26} />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-black text-[#0f274a]">Remove Officer</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to remove{" "}
                  <span className="font-bold text-slate-800">{deleteTarget.fullName}</span>?
                  <br />
                  <span className="font-mono text-slate-400">{deleteTarget.employeeId}</span>
                </p>
                <p className="text-[11px] text-rose-500 font-semibold pt-1">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <><RefreshCw size={13} className="animate-spin" /> Deleting...</>
                ) : (
                  <><Trash2 size={13} /> Yes, Remove</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
