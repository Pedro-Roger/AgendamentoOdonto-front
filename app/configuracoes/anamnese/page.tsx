"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Topbar } from "@/components/Topbar";
import { ConfigTabs } from "@/components/ConfigTabs";
import {
  Type,
  AlignLeft,
  CheckSquare,
  Circle,
  ListChecks,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  FileQuestion,
} from "lucide-react";
import { adminApi } from "@/src/lib/frontend-api";

type FieldType = "text" | "textarea" | "select" | "radio" | "checkbox";

type Field = { key: string; label: string; type: FieldType };

const tipos: Array<{ type: FieldType; label: string; icon: any }> = [
  { type: "text", label: "Texto curto", icon: Type },
  { type: "textarea", label: "Texto longo", icon: AlignLeft },
  { type: "radio", label: "Múltipla escolha", icon: Circle },
  { type: "checkbox", label: "Caixas de seleção", icon: CheckSquare },
  { type: "select", label: "Lista suspensa", icon: ListChecks },
];

const iconMap: Record<FieldType, any> = {
  text: Type,
  textarea: AlignLeft,
  radio: Circle,
  checkbox: CheckSquare,
  select: ListChecks,
};

function newKey() {
  return `q_${Math.random().toString(36).slice(2, 8)}`;
}

export default function AnamnesePage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi
      .getFormSettings()
      .then((s) => setFields((s?.fields ?? []) as Field[]))
      .catch((e: any) => setError(e?.message ?? "Erro ao carregar formulário"))
      .finally(() => setLoaded(true));
  }, []);

  function addField(type: FieldType) {
    setFields((prev) => [...prev, { key: newKey(), label: "", type }]);
  }

  function updateLabel(idx: number, label: string) {
    setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, label } : f)));
  }

  function updateType(idx: number, type: FieldType) {
    setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, type } : f)));
  }

  function removeField(idx: number) {
    setFields((prev) => prev.filter((_, i) => i !== idx));
  }

  async function publish() {
    setError(null);
    setSuccess(false);
    if (fields.some((f) => !f.label.trim())) {
      setError("Preencha o rótulo de todas as perguntas.");
      return;
    }
    setSaving(true);
    try {
      await adminApi.createFormSettings(fields);
      setSuccess(true);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao publicar formulário");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <Topbar
        title="Configurações"
        subtitle="Personalize o formulário de anamnese"
        actionSlot={
          <button
            onClick={publish}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-sage-400 text-white rounded-full text-sm font-medium hover:bg-sage-500 disabled:opacity-60 transition-colors shadow-soft"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Publicar formulário
          </button>
        }
      />
      <ConfigTabs />

      {error && (
        <div role="alert" className="mb-4 flex items-start gap-2.5 px-3.5 py-3 rounded-2xl bg-rose-100 border border-rose-200 text-rose-400 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 px-3.5 py-3 rounded-2xl bg-sage-100 border border-sage-200 text-sage-600 text-sm">
          Formulário publicado.
        </div>
      )}

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white border border-sage-100 rounded-3xl p-5 h-fit sticky top-6">
          <h3 className="font-display text-base text-ink-700 mb-1">Adicionar campo</h3>
          <p className="text-xs text-ink-400 mb-4">Clique para inserir.</p>

          <div className="space-y-1.5">
            {tipos.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.type}
                  onClick={() => addField(t.type)}
                  aria-label={`Adicionar ${t.label}`}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-cream-100 text-left text-sm text-ink-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center text-sage-600">
                    <Icon size={14} />
                  </div>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="col-span-3">
          <div className="bg-white border border-sage-100 rounded-3xl p-7">
            <div className="pb-6 mb-6 border-b border-sage-100">
              <h1 className="font-display text-2xl text-ink-700 mb-1">
                Formulário de anamnese
              </h1>
              <p className="text-sm text-ink-500">
                Configure as perguntas que o paciente responderá no agendamento.
              </p>
            </div>

            {loaded && fields.length === 0 && (
              <div className="py-10 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-sage-100 text-sage-600 flex items-center justify-center mb-4">
                  <FileQuestion size={24} />
                </div>
                <p className="text-sm text-ink-500 max-w-sm mx-auto">
                  Nenhuma pergunta ainda. Adicione campos no painel ao lado.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {fields.map((f, idx) => {
                const Icon = iconMap[f.type];
                return (
                  <div
                    key={f.key}
                    className="border border-sage-100 rounded-2xl p-5 bg-cream-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-sage-100 text-sage-600 flex items-center justify-center text-xs font-mono shrink-0 mt-0.5">
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2.5">
                          <Icon size={13} className="text-ink-400" />
                          <select
                            aria-label={`Tipo da pergunta ${idx + 1}`}
                            value={f.type}
                            onChange={(e) => updateType(idx, e.target.value as FieldType)}
                            className="text-[11px] text-ink-500 bg-transparent border border-sage-100 rounded-md px-1.5 py-0.5"
                          >
                            {tipos.map((t) => (
                              <option key={t.type} value={t.type}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <label className="sr-only" htmlFor={`field-${idx}`}>
                          Rótulo da pergunta {idx + 1}
                        </label>
                        <input
                          id={`field-${idx}`}
                          aria-label={`Rótulo da pergunta ${idx + 1}`}
                          value={f.label}
                          onChange={(e) => updateLabel(idx, e.target.value)}
                          placeholder="Digite a pergunta…"
                          className="w-full text-sm font-medium text-ink-700 bg-white border border-sage-100 rounded-lg px-3 py-2 focus:outline-none focus:border-sage-300"
                        />
                      </div>
                      <button
                        onClick={() => removeField(idx)}
                        aria-label={`Remover pergunta ${idx + 1}`}
                        className="w-7 h-7 rounded-lg hover:bg-rose-100 flex items-center justify-center text-ink-500 hover:text-rose-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => addField("text")}
                className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-sage-200 hover:border-sage-300 rounded-2xl text-sm text-sage-600"
              >
                <Plus size={16} /> Adicionar nova pergunta
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
