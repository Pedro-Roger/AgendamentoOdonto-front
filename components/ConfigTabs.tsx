"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const tabs = [
  { href: "/configuracoes/servicos", label: "Serviços" },
  { href: "/configuracoes/horarios", label: "Horários" },
  { href: "/configuracoes/anamnese", label: "Anamnese" },
  { href: "/configuracoes/integracoes", label: "Integrações", masterOnly: true },
  { href: "/configuracoes/usuarios", label: "Usuários", masterOnly: true },
];

export function ConfigTabs() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/session/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setRole(d.user?.role ?? null))
      .catch(() => setRole(null));
  }, []);

  const visible = tabs.filter((t) => !t.masterOnly || role === "MASTER");

  return (
    <div className="flex items-center gap-1 mb-8 border-b border-sage-100 overflow-x-auto">
      {visible.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`px-4 py-3 text-sm relative transition-colors whitespace-nowrap ${
              active
                ? "text-ink-700 font-medium"
                : "text-ink-400 hover:text-ink-600"
            }`}
          >
            {t.label}
            {active && (
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-sage-400 rounded-full"></span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
