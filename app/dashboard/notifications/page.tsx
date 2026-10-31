"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Loader2, ArrowRight } from "lucide-react";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  complaintId?: string;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function typeIcon(type: string) {
  switch (type) {
    case "welcome": return "🎉";
    case "complaint_submitted": return "📋";
    case "status_changed": return "🔄";
    case "officer_update": return "🔍";
    default: return "🔔";
  }
}

export default function StudentNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");

  const fetchNotifications = useCallback(async (userEmail: string) => {
    const res = await fetch(`/api/notifications?recipientId=${encodeURIComponent(userEmail)}&recipientType=student`);
    const data = await res.json();
    if (data.success) setNotifications(data.notifications);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("complaint_user");
    if (!raw) { router.push("/login"); return; }
    try {
      const user = JSON.parse(raw);
      setEmail(user.email || "");
      fetchNotifications(user.email || "");
    } catch { router.push("/login"); }
  }, [router, fetchNotifications]);

  const markOneRead = async (id: string) => {
    const notif = notifications.find((n) => n._id === id);
    if (!notif || notif.isRead) return;
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    }).catch(() => {});
    window.dispatchEvent(new Event("notifications-read"));
  };

  const markAllRead = async () => {
    if (!email) return;
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId: email, recipientType: "student" }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    window.dispatchEvent(new Event("notifications-read"));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <main className="p-4 sm:p-8 w-full space-y-5 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#0f274a] tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer">
            <CheckCheck size={14} /> Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-[#1e40af] animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-slate-200">
          <Bell size={40} className="text-slate-200" />
          <div className="text-center">
            <p className="font-bold text-slate-500">No notifications yet</p>
            <p className="text-xs text-slate-400 mt-1">You&apos;ll be notified when your complaint status changes.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => markOneRead(n._id)}
              className={`bg-white rounded-2xl border p-4 flex items-start gap-4 transition-all ${!n.isRead ? "border-[#1e40af] border-l-4 shadow-xs cursor-pointer hover:bg-blue-50/30" : "border-slate-200"}`}
            >
              <div className="text-2xl shrink-0 mt-0.5">{typeIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <p className={`text-sm font-bold ${!n.isRead ? "text-[#0f274a]" : "text-slate-700"}`}>{n.title}</p>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">{n.message}</p>
                {n.complaintId && (
                  <Link
                    href={`/dashboard/complaints/${encodeURIComponent(n.complaintId)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-[#1e40af] hover:underline no-underline"
                  >
                    <span className="font-mono">{n.complaintId}</span>
                    <ArrowRight size={11} />
                  </Link>
                )}
              </div>
              {!n.isRead && <div className="w-2 h-2 rounded-full bg-[#1e40af] shrink-0 mt-1.5" />}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
