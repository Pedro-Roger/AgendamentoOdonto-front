"use client";

import { Bell, Check, CheckCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { adminApi, NotificationDto } from "../src/lib/frontend-api";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "agora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchUnread = useCallback(async () => {
    try {
      const data = await adminApi.unreadNotifications();
      setUnreadCount(data.length);
    } catch {
      /* ignore polling errors */
    }
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const data = await adminApi.listNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.readAt).length);
    } catch {
      /* ignore */
    }
  }, []);

  // Poll unread count every 30 seconds
  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30_000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  // Fetch all when dropdown opens
  useEffect(() => {
    if (open) fetchAll();
  }, [open, fetchAll]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const markRead = async (id: string) => {
    try {
      await adminApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* ignore */
    }
  };

  const markAllRead = async () => {
    try {
      await adminApi.markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 rounded-full bg-cream-100 border border-sage-100 flex items-center justify-center text-ink-500 hover:bg-cream-200 transition-colors relative"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-peach-400 text-white text-[10px] font-bold rounded-full leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white border border-sage-100 rounded-2xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-sage-100">
            <span className="font-display text-sm text-ink-700">
              Notificações
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-sage-500 hover:text-sage-700 transition-colors"
              >
                <CheckCheck size={14} />
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-ink-400">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-sage-50 last:border-b-0 cursor-pointer hover:bg-cream-50 transition-colors ${
                    !n.readAt ? "bg-cream-50/60" : ""
                  }`}
                  onClick={() => !n.readAt && markRead(n.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {!n.readAt && (
                          <span className="w-2 h-2 bg-peach-400 rounded-full flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium text-ink-700 truncate">
                          {n.title}
                        </span>
                      </div>
                      <p className="text-xs text-ink-400 mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                    <span className="text-[10px] text-ink-300 flex-shrink-0 mt-0.5">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
