"use client";

import { useCallback, useEffect, useState } from "react";
import {
  KeyRound,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  ShieldOff,
} from "lucide-react";
import { apiKeysApi, type ApiKeyDto } from "@/src/lib/frontend-api";

const inputCls =
  "w-full px-3.5 py-2.5 bg-cream-50 border border-sage-100 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:bg-white transition-all";

type CreatedKey = ApiKeyDto & { plaintextKey: string };

export function ApiKeysSection() {
  const [keys, setKeys] = useState<ApiKeyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [origins, setOrigins] = useState("");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<CreatedKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const list = await apiKeysApi.list();
      setKeys(list);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao carregar chaves.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Informe um nome para a chave.");
      return;
    }
    setCreating(true);
    setError(null);
    const allowedOrigins = origins
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    try {
      const res = await apiKeysApi.create({ name: name.trim(), allowedOrigins });
      setCreated(res);
      setName("");
      setOrigins("");
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? "Erro ao criar chave.");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    try {
      await apiKeysApi.revoke(id);
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? "Erro ao revogar chave.");
    }
  }

  async function copyPlaintext() {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.plaintextKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://seu-dominio.com";
  const exampleKey = created?.plaintextKey ?? "sk_sua_chave_aqui";
  const snippet = `fetch("${origin}/api/integrations/appointments", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Api-Key": "${exampleKey}"
  },
  body: JSON.stringify({
    name: "Maria Silva",
    cpf: "12345678901",
    email: "maria@email.com",
    phone: "11912345678",
    serviceId: "<id-do-servico>",
    date: "2026-06-20",
    time: "09:00",
    anamnesisAnswers: []
  })
});`;

  return (
    <div className="bg-white border border-sage-100 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-sage-100 flex items-center justify-center">
          <KeyRound size={20} className="text-sage-600" />
        </div>
        <div className="flex-1">
          <h2 className="font-display text-xl text-ink-700">API Keys</h2>
          <p className="text-xs text-ink-400 mt-0.5">
            Integre seu site ou sistema externo via API.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 px-3.5 py-3 rounded-2xl bg-rose-100 border border-rose-200 text-rose-400 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Plaintext just created */}
      {created && (
        <div className="mb-6 p-4 rounded-2xl bg-peach-100 border border-peach-200">
          <p className="text-xs font-medium text-ink-700 mb-2">
            Chave criada: <strong>{created.name}</strong>
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-white rounded-xl text-xs text-ink-700 break-all border border-peach-200">
              {created.plaintextKey}
            </code>
            <button
              type="button"
              onClick={copyPlaintext}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-sage-400 text-white rounded-full text-xs font-medium hover:bg-sage-500 shrink-0"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <p className="text-[11px] text-peach-600 mt-2 font-medium">
            Copie agora — esta chave não será exibida novamente.
          </p>
        </div>
      )}

      {/* Keys list */}
      <div className="space-y-2 mb-6">
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-ink-400 px-1 py-2">
            <Loader2 size={14} className="animate-spin" /> Carregando chaves…
          </div>
        ) : keys.length === 0 ? (
          <p className="text-xs text-ink-400 px-3 py-3 bg-cream-100 rounded-2xl">
            Nenhuma chave criada ainda.
          </p>
        ) : (
          keys.map((k) => {
            const revoked = !!k.revokedAt;
            return (
              <div
                key={k.id}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl border border-sage-100 ${
                  revoked ? "bg-cream-50 opacity-60" : "bg-cream-50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-700 truncate">{k.name}</p>
                  <p className="text-xs text-ink-400 font-mono">
                    sk_••••{k.prefix.slice(-4)}
                  </p>
                </div>
                <div className="text-xs text-ink-400 hidden sm:block">
                  {k.lastUsedAt
                    ? `Usada em ${new Date(k.lastUsedAt).toLocaleDateString("pt-BR")}`
                    : "Nunca usada"}
                </div>
                {revoked ? (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-400 font-medium">
                    Revogada
                  </span>
                ) : (
                  <>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-sage-100 text-sage-600 font-medium">
                      Ativa
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRevoke(k.id)}
                      className="inline-flex items-center gap-1 text-xs text-rose-400 hover:underline shrink-0"
                    >
                      <ShieldOff size={12} /> Revogar
                    </button>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New key form */}
      <form onSubmit={handleCreate} className="space-y-3 mb-6">
        <h3 className="font-display text-base text-ink-700">Nova chave</h3>
        <div>
          <label className="block text-xs font-medium text-ink-500 mb-1.5">Nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da chave (ex: Site institucional)"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-500 mb-1.5">
            Domínios permitidos (opcional, um por linha)
          </label>
          <textarea
            value={origins}
            onChange={(e) => setOrigins(e.target.value)}
            rows={2}
            placeholder="https://seusite.com.br"
            className={inputCls}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sage-400 text-white rounded-full text-sm font-medium hover:bg-sage-500 disabled:opacity-50 shadow-soft"
          >
            {creating && <Loader2 size={14} className="animate-spin" />}
            Gerar chave
          </button>
        </div>
      </form>

      {/* Snippet */}
      <div>
        <h3 className="font-display text-base text-ink-700 mb-2">Como integrar</h3>
        <p className="text-xs text-ink-400 mb-3">
          Envie uma requisição <code>POST</code> com o header <code>X-Api-Key</code>.
        </p>
        <pre className="text-[11px] leading-relaxed bg-ink-700 text-cream-50 rounded-2xl p-4 overflow-x-auto">
          <code>{snippet}</code>
        </pre>
      </div>
    </div>
  );
}
