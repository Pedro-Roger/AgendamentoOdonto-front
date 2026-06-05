"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Image from "next/image";

export default function ConfirmarConsultaPage() {
  const params = useParams<{ token: string }>();
  const [status, setStatus] = useState<"loading" | "confirmed" | "error">("loading");

  useEffect(() => {
    if (!params.token) return;
    fetch(`/api/backend/api/public/confirm/${params.token}`, { method: "POST" })
      .then((r) => r.json())
      .then((d: any) => setStatus(d.confirmed ? "confirmed" : "error"))
      .catch(() => setStatus("error"));
  }, [params.token]);

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-soft p-8 text-center space-y-5">
        <div className="flex justify-center mb-2">
          <Image src="/sorriso.png" alt="Sorriso" width={180} height={80} className="h-auto" />
        </div>

        {status === "loading" && (
          <>
            <Loader2 size={40} className="animate-spin text-sage-400 mx-auto" />
            <p className="text-ink-500 text-sm">Confirmando sua presença...</p>
          </>
        )}

        {status === "confirmed" && (
          <>
            <CheckCircle2 size={48} className="text-sage-400 mx-auto" />
            <h1 className="font-display text-2xl text-ink-700">Confirmado!</h1>
            <p className="text-ink-500 text-sm">
              Sua consulta foi confirmada com sucesso. Te esperamos!
            </p>
            <p className="text-xs text-ink-400">Até logo 🦷</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle size={48} className="text-rose-400 mx-auto" />
            <h1 className="font-display text-2xl text-ink-700">Link inválido</h1>
            <p className="text-ink-500 text-sm">
              Este link já foi utilizado ou não é mais válido. Entre em contato com a clínica.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
