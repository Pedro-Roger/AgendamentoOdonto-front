import { AppShell } from "@/components/AppShell";
import { Topbar } from "@/components/Topbar";
import { FileSignature, Clock, Smartphone, X as XIcon } from "lucide-react";

export default function AssinaturasPage() {
  const stats = [
    { value: "0", label: "Assinaturas no mês", icon: FileSignature, tone: "sage" },
    { value: "0", label: "Aguardando paciente", icon: Clock, tone: "peach" },
    { value: "0%", label: "São eletrônicas", icon: Smartphone, tone: "sage" },
    { value: "0", label: "Expiradas este mês", icon: XIcon, tone: "rose" },
  ];

  const tone: Record<string, string> = {
    sage: "bg-sage-100 text-sage-600",
    peach: "bg-peach-100 text-peach-500",
    rose: "bg-rose-100 text-rose-400",
  };

  return (
    <AppShell>
      <Topbar
        title="Assinaturas"
        subtitle="Acompanhe os documentos enviados e recebidos"
      />

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white border border-sage-100 rounded-3xl p-5">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${tone[s.tone]}`}>
                <Icon size={18} />
              </div>
              <div className="font-display text-3xl text-ink-700">{s.value}</div>
              <div className="text-xs text-ink-500 mt-1">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-sage-100 rounded-3xl p-10 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-sage-100 text-sage-600 flex items-center justify-center mb-4">
          <FileSignature size={24} />
        </div>
        <h2 className="font-display text-xl text-ink-700 mb-2">
          Nenhuma assinatura registrada
        </h2>
        <p className="text-sm text-ink-500 max-w-md mx-auto">
          Quando um link de assinatura for enviado a partir do prontuário, o status aparecerá nesta lista.
        </p>
      </div>
    </AppShell>
  );
}
