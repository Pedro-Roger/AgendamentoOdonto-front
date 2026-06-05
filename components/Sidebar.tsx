"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, createContext, useContext } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  Settings,
  Stethoscope,
  FileSignature,
  LogOut,
  X,
  BarChart2,
} from "lucide-react";
import Image from "next/image";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
};

const nav: NavItem[] = [
  {
    href: "/dashboard",
    label: "Visão geral",
    icon: LayoutDashboard,
    roles: ["MASTER", "ADMIN", "DENTISTA", "RECEPCIONISTA"],
  },
  {
    href: "/pacientes/lista",
    label: "Pacientes",
    icon: Users,
    roles: ["MASTER", "ADMIN", "DENTISTA", "RECEPCIONISTA"],
  },
  {
    href: "/agenda",
    label: "Agenda",
    icon: CalendarDays,
    roles: ["MASTER", "ADMIN", "DENTISTA", "RECEPCIONISTA"],
  },
  {
    href: "/prontuario",
    label: "Atendimento",
    icon: Stethoscope,
    roles: ["MASTER", "ADMIN", "DENTISTA"],
  },
  {
    href: "/assinatura",
    label: "Assinaturas",
    icon: FileSignature,
    roles: ["MASTER", "ADMIN", "DENTISTA"],
  },
  {
    href: "/relatorios",
    label: "Relatórios",
    icon: BarChart2,
    roles: ["MASTER", "ADMIN"],
  },
  {
    href: "/configuracoes/servicos",
    label: "Configurações",
    icon: Settings,
    roles: ["MASTER", "ADMIN"],
  },
];

export const roleLabel: Record<string, string> = {
  MASTER: "Master",
  ADMIN: "Administradora",
  DENTISTA: "Dentista",
  RECEPCIONISTA: "Recepcionista",
};

type SessionUser = { id: string; name: string; email: string; role: string };

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

type SidebarContextType = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

export const SidebarContext = createContext<SidebarContextType>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch("/api/session/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, []);

  async function logout() {
    await fetch("/api/session/logout", { method: "POST" }).catch(() => null);
    router.push("/login");
  }

  const visibleNav = nav.filter(
    (item) => !user || item.roles.includes(user.role)
  );

  return (
    <>
      <Link
        href="/dashboard"
        className="flex items-center justify-center mb-10 px-2"
        onClick={onNavClick}
      >
        <Image
          src="/sorriso.png"
          alt="Sorriso Clinica Odontologica"
          width={260}
          height={120}
          priority
          className="h-auto w-full max-h-32 object-contain"
        />
      </Link>

      <nav className="flex flex-col gap-1">
        {visibleNav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(
                item.href.split("/").slice(0, 2).join("/")
              ));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                active
                  ? "bg-sage-200 text-ink-700 font-medium shadow-soft"
                  : "text-ink-500 hover:bg-cream-200 hover:text-ink-700"
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-sage-100">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-10 h-10 rounded-full bg-peach-200 flex items-center justify-center font-display text-ink-700">
            {user ? initials(user.name) : "..."}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-ink-700 truncate">
              {user?.name ?? "Carregando..."}
            </div>
            <div className="text-xs text-ink-400 truncate">
              {user ? (roleLabel[user.role] ?? user.role) : ""}
            </div>
          </div>
          <button
            onClick={logout}
            aria-label="Sair"
            className="text-ink-400 hover:text-rose-400 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );
}

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useSidebar();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 shrink-0 bg-cream-100 border-r border-sage-100 min-h-screen hidden lg:flex flex-col p-5">
        <SidebarContent />
      </aside>

      {/* Mobile overlay drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-700/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-cream-100 flex flex-col p-5 shadow-2xl animate-slideIn">
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Fechar menu"
              className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-cream-200 flex items-center justify-center text-ink-500"
            >
              <X size={18} />
            </button>
            <SidebarContent onNavClick={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
