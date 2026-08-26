"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://www.maissorriso.online";
const FALLBACK_SLUG = process.env.NEXT_PUBLIC_DEFAULT_BOOKING_SLUG ?? "dra-herlania";

export function BookingLinkButton() {
  const [tenantSlug, setTenantSlug] = useState(FALLBACK_SLUG);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/session/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.user?.tenantSlug) setTenantSlug(data.user.tenantSlug);
      })
      .catch(() => undefined);
  }, []);

  const bookingUrl = useMemo(() => `${SITE_URL}/agendar/${tenantSlug}`, [tenantSlug]);

  async function copyLink() {
    await navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex items-center gap-1 bg-white border border-sage-100 rounded-full p-1 shadow-soft">
      <button
        type="button"
        onClick={copyLink}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-ink-600 hover:bg-cream-100 transition-colors"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        <span>{copied ? "Copiado" : "Copiar link do formulário"}</span>
      </button>
      <a
        href={bookingUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Abrir formulário"
        className="h-8 w-8 rounded-full bg-sage-100 text-sage-600 hover:bg-sage-200 flex items-center justify-center transition-colors"
      >
        <ExternalLink size={14} />
      </a>
    </div>
  );
}
