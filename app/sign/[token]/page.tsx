import Image from "next/image";
import { FileSignature, ShieldCheck } from "lucide-react";
import { SignaturePad } from "@/components/SignaturePad";

export default async function SignPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/sorriso.png"
            alt="Sorriso Clínica Odontológica"
            width={220}
            height={80}
            priority
            className="h-auto w-auto max-h-24 object-contain mb-3"
          />
          <p className="text-xs text-ink-400 tracking-wide uppercase">Assinatura eletrônica</p>
        </div>

        <div className="bg-white border border-sage-100 rounded-3xl shadow-card p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-sage-100 text-sage-600 flex items-center justify-center shrink-0">
              <FileSignature size={22} />
            </div>
            <div>
              <h1 className="font-display text-2xl text-ink-700 leading-tight">
                Assine seu prontuário
              </h1>
              <p className="text-sm text-ink-500 mt-1">
                Desenhe sua assinatura no quadro abaixo para concluir o atendimento.
              </p>
            </div>
          </div>

          <SignaturePad token={token} />
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-ink-400">
          <ShieldCheck size={14} className="text-sage-500" />
          Documento protegido. Link de uso único.
        </div>
      </div>
    </div>
  );
}
