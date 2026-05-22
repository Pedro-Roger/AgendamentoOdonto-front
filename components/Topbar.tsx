"use client";

import { Search, Bell, Plus } from "lucide-react";
import type { ReactNode } from "react";

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
  return (
    <header className="flex items-center justify-between mb-8 pt-2">
      <div>
        <h1 className="font-display text-3xl text-ink-700 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-ink-400 text-sm mt-1">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            type="text"
            placeholder="Buscar paciente, prontuário..."
            className="w-72 pl-10 pr-4 py-2.5 bg-cream-100 border border-sage-100 rounded-full text-sm placeholder:text-ink-400 focus:outline-none focus:border-sage-300 focus:bg-white transition-all"
          />
        </div>
        <button className="w-10 h-10 rounded-full bg-cream-100 border border-sage-100 flex items-center justify-center text-ink-500 hover:bg-cream-200 transition-colors relative">
          <Bell size={16} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-peach-400 rounded-full"></span>
        </button>
        {actionSlot}
        {!actionSlot && action && (
          <button
            onClick={action.onClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-sage-400 text-white rounded-full text-sm font-medium hover:bg-sage-500 transition-colors shadow-soft"
          >
            <Plus size={16} strokeWidth={2.4} />
            {action.label}
          </button>
        )}
      </div>
    </header>
  );
}
