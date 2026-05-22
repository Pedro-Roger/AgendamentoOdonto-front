"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/configuracoes/servicos", label: "Serviços" },
  { href: "/configuracoes/horarios", label: "Horários" },
  { href: "/configuracoes/anamnese", label: "Formulário de Anamnese" },
];

export function ConfigTabs() {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-1 mb-8 border-b border-sage-100">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`px-4 py-3 text-sm relative transition-colors ${
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
