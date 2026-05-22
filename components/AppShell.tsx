import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-cream-50">
      <Sidebar />
      <main className="flex-1 px-10 py-6 overflow-x-hidden">{children}</main>
    </div>
  );
}
