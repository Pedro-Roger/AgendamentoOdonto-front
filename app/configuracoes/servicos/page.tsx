"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Topbar } from "@/components/Topbar";
import { ConfigTabs } from "@/components/ConfigTabs";
import {
  Trash2,
  Clock,
  Plus,
  X,
  Loader2,
  ClipboardList,
  AlertCircle,
} from "lucide-react";
import { adminApi } from "@/src/lib/frontend-api";
import type { ServiceDto } from "@/src/types/dto";

export default function ServicosPage() {
  const [services, setServices] = useState<ServiceDto[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function refresh() {
    try {
      const list = await adminApi.listServices();
      setServices(list);
    } catch (e: any) {
      setLoadError(e?.message ?? "Erro ao carregar serviços");
      setServices([]);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function deactivate(s: ServiceDto) {
    try {
      await adminApi.updateService(s.id, { isActive: false });
      await refresh();
    } catch (e: any) {
      setLoadError(e?.message ?? "Erro ao desativar serviço");
    }
  }

  return (
    <AppShell>
      <Topbar
        title="Configurações"
        subtitle="Personalize sua clínica do jeito que você atende"
        actionSlot={
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-sage-400 text-white rounded-full text-sm font-medium hover:bg-sage-500 transition-colors shadow-soft"
          >
            <Plus size={16} strokeWidth={2.4} />
            Novo serviço
          </button>
        }
      />
      <ConfigTabs />

      {loadError && (
        <div role="alert" className="mb-4 flex items-start gap-2.5 px-3.5 py-3 rounded-2xl bg-rose-100 border border-rose-200 text-rose-400 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      <div className="bg-white border border-sage-100 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-sage-100">
          <h2 className="font-display text-xl text-ink-700">Serviços oferecidos</h2>
          <p className="text-xs text-ink-400 mt-0.5">
            {services
              ? `${services.filter((s) => s.isActive).length} serviços ativos`
              : "Carregando…"}
          </p>
        </div>

        {services && services.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-sage-100 text-sage-600 flex items-center justify-center mb-4">
              <ClipboardList size={24} />
            </div>
            <p className="text-sm text-ink-500 max-w-sm mx-auto">
              Nenhum serviço cadastrado. Clique em{" "}
              <span className="font-medium text-ink-700">Novo serviço</span> para começar.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="text-left text-xs text-ink-400 uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Serviço</th>
                <th className="px-6 py-3 font-medium">Duração</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium w-32">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(services ?? []).map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-sage-100 hover:bg-cream-100/60 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-sage-300" />
                      <span className="text-sm font-medium text-ink-700">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-ink-500">
                      <Clock size={13} className="text-ink-400" />
                      {s.durationMinutes} min
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full ${
                        s.isActive
                          ? "bg-sage-100 text-sage-600"
                          : "bg-cream-200 text-ink-400"
                      }`}
                    >
                      {s.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {s.isActive && (
                      <button
                        aria-label={`Desativar ${s.name}`}
                        onClick={() => deactivate(s)}
                        className="w-8 h-8 rounded-lg hover:bg-rose-100 flex items-center justify-center text-ink-500 hover:text-rose-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {open && (
        <NewServiceModal
          existing={services ?? []}
          onClose={() => setOpen(false)}
          onCreated={async () => {
            setOpen(false);
            await refresh();
          }}
        />
      )}
    </AppShell>
  );
}

function NewServiceModal({
  existing,
  onClose,
  onCreated,
}: {
  existing: ServiceDto[];
  onClose: () => void;
  onCreated: () => void | Promise<void>;
}) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("30");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const normalizedExisting = useMemo(
    () => new Set(existing.map((s) => s.name.trim().toLowerCase())),
    [existing]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    const mins = Number(duration);
    setError(null);

    if (!trimmed) {
      setError("Informe o nome do serviço.");
      return;
    }
    if (normalizedExisting.has(trimmed.toLowerCase())) {
      setError("Já existe um serviço com esse nome.");
      return;
    }
    if (!Number.isFinite(mins) || mins <= 0) {
      setError("Duração inválida.");
      return;
    }

    setSubmitting(true);
    try {
      await adminApi.createService({ name: trimmed, durationMinutes: mins });
      await onCreated();
    } catch (e: any) {
      setError(e?.message ?? "Erro ao criar serviço");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-700/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-sage-100">
          <h2 className="font-display text-2xl text-ink-700">Novo serviço</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-9 h-9 rounded-full hover:bg-cream-100 flex items-center justify-center text-ink-500"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label htmlFor="svc-name" className="block text-xs font-medium text-ink-500 mb-1.5">
              Nome do serviço
            </label>
            <input
              id="svc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-sage-100 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:bg-white"
              placeholder="Ex.: Limpeza & Profilaxia"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="svc-duration" className="block text-xs font-medium text-ink-500 mb-1.5">
              Duração (minutos)
            </label>
            <input
              id="svc-duration"
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-sage-100 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:bg-white"
            />
          </div>

          {error && (
            <div role="alert" className="text-xs text-rose-400 bg-rose-100 rounded-2xl px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-sm text-ink-500 hover:bg-cream-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-full text-sm font-medium bg-sage-400 text-white hover:bg-sage-500 disabled:opacity-50 shadow-soft inline-flex items-center gap-2"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
