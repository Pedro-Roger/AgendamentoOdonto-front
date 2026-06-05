"use client";

import { useState } from "react";
import { Sidebar, SidebarContext } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      <div className="flex min-h-screen bg-cream-50">
        <Sidebar />
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-4 lg:py-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
