"use client";

import { Search, Plus, Menu } from "lucide-react";
import type { ReactNode } from "react";
import { useSidebar } from "./Sidebar";
import { NotificationBell } from "./NotificationBell";

export function Topbar({
  title,
  subtitle,
  action,
  actionSlot,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; onClick?: () => void };
  actionSlot?: ReactNode;
}) {
  const { setSidebarOpen } = useSidebar();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8 pt-2">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menu"
          className="lg:hidden w-10 h-10 rounded-full bg-cream-100 border border-sage-100 flex items-center justify-center text-ink-500 hover:bg-cream-200 transition-colors shrink-0"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-ink-700 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-ink-400 text-sm mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 sm:flex-none">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            type="text"
            placeholder="Buscar paciente, prontuario..."
            className="w-full sm:w-72 pl-10 pr-4 py-2.5 bg-cream-100 border border-sage-100 rounded-full text-sm placeholder:text-ink-400 focus:outline-none focus:border-sage-300 focus:bg-white transition-all"
          />
        </div>
        <NotificationBell />
        {actionSlot}
        {!actionSlot && action && (
          <button
            onClick={action.onClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-sage-400 text-white rounded-full text-sm font-medium hover:bg-sage-500 transition-colors shadow-soft shrink-0"
          >
            <Plus size={16} strokeWidth={2.4} />
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        )}
      </div>
    </header>
  );
}
