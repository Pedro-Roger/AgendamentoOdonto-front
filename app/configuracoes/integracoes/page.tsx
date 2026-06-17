"use client";

import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { Topbar } from "@/components/Topbar";
import { ConfigTabs } from "@/components/ConfigTabs";
import {
  MessageCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Send,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { adminApi } from "@/src/lib/frontend-api";
import { ApiKeysSection } from "@/components/integracoes/ApiKeysSection";
import Image from "next/image";

const inputCls =
  "w-full px-3.5 py-2.5 bg-cream-50 border border-sage-100 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:bg-white transition-all";

type WaStatus = "disconnected" | "connecting" | "connected";

export default function IntegracoesPage() {
  const [status, setStatus] = useState<WaStatus>("disconnected");
  const [qr, setQr] = useState<string | null>(null);
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [testResult, setTestResult] = useState<"sent" | "failed" | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res: any = await adminApi.getWhatsAppStatus();
      setStatus(res.status);
      setQr(res.qr ?? null);
    } catch {}
  }, []);

  // Carrega config e status inicial
  useEffect(() => {
    adminApi.getWhatsAppConfig().then((cfg: any) => {
      if (!cfg) return;
      setClinicName(cfg.clinicName ?? "");
      setClinicAddress(cfg.clinicAddress ?? "");
    }).catch(() => {});
    fetchStatus();
  }, [fetchStatus]);

  // Polling enquanto não conectado (a cada 5s para renovar QR)
  useEffect(() => {
    if (status === "connected") return;
    const t = setInterval(fetchStatus, 5000);
    return () => clearInterval(t);
  }, [status, fetchStatus]);

  async function save() {
    setError(null);
    setSuccess(null);
    if (!clinicName.trim()) { setError("Informe o nome da clínica."); return; }
    setSaving(true);
    try {
      await adminApi.saveWhatsAppConfig({
        clinicName: clinicName.trim(),
        clinicAddress: clinicAddress.trim(),
      });
      setSuccess("Configuração salva.");
    } catch (e: any) {
      setError(e?.message ?? "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function resetSession() {
    setResetting(true);
    setQr(null);
    setStatus("connecting");
    try {
      await adminApi.resetWhatsAppSession();
      setTimeout(fetchStatus, 2000);
    } catch {} finally {
      setResetting(false);
    }
  }

  async function testMessage() {
    setTestResult(null);
    setTesting(true);
    try {
      const res = await adminApi.testWhatsApp(testPhone.trim());
      setTestResult(res.sent ? "sent" : "failed");
    } catch {
      setTestResult("failed");
    } finally {
      setTesting(false);
    }
  }

  return (
    <AppShell>
      <Topbar title="Configurações" subtitle="Integrações da clínica" />
      <ConfigTabs />

      <div className="max-w-2xl space-y-6">
        {/* Status card */}
        <div className="bg-white border border-sage-100 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-[#25D366]/10 flex items-center justify-center">
              <MessageCircle size={20} className="text-[#25D366]" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl text-ink-700">WhatsApp</h2>
              <p className="text-xs text-ink-400 mt-0.5">Lembretes automáticos via Baileys</p>
            </div>
            <StatusBadge status={status} />
          </div>

          {/* QR Code */}
          {status !== "connected" && (
            <div className="flex flex-col items-center py-6 gap-4">
              {qr ? (
                <>
                  <p className="text-sm text-ink-600 font-medium">Escaneie o QR code com o WhatsApp</p>
                  <QrImage qr={qr} />
                  <p className="text-xs text-ink-400">Abra o WhatsApp → Aparelhos conectados → Conectar aparelho</p>
                </>
              ) : (
                <div className="flex items-center gap-2 text-ink-400 text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Gerando QR code...
                </div>
              )}
              <button
                onClick={fetchStatus}
                className="text-xs text-sage-600 hover:underline flex items-center gap-1"
              >
                <RefreshCw size={12} /> Atualizar
              </button>
            </div>
          )}

          {/* Conectado */}
          {status === "connected" && (
            <div className="flex flex-col items-center py-4 gap-3">
              <CheckCircle2 size={40} className="text-[#25D366]" />
              <p className="text-sm font-medium text-ink-700">WhatsApp conectado e pronto para enviar lembretes</p>
              <button
                onClick={resetSession}
                disabled={resetting}
                className="text-xs text-rose-400 hover:underline flex items-center gap-1"
              >
                {resetting ? <Loader2 size={12} className="animate-spin" /> : <WifiOff size={12} />}
                Desconectar / trocar número
              </button>
            </div>
          )}
        </div>

        {/* Config da clínica */}
        <div className="bg-white border border-sage-100 rounded-3xl p-6">
          <h3 className="font-display text-base text-ink-700 mb-4">Dados da clínica</h3>
          <p className="text-xs text-ink-400 mb-4">Aparecem na mensagem de lembrete enviada ao paciente.</p>

          {error && (
            <div className="mb-4 flex items-start gap-2 px-3.5 py-3 rounded-2xl bg-rose-100 border border-rose-200 text-rose-400 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 px-3.5 py-3 rounded-2xl bg-sage-100 border border-sage-200 text-sage-600 text-sm">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-1.5">
                Nome da clínica <span className="text-rose-400">*</span>
              </label>
              <input value={clinicName} onChange={e => setClinicName(e.target.value)}
                placeholder="Ex: Clínica Sorriso" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-1.5">Endereço</label>
              <input value={clinicAddress} onChange={e => setClinicAddress(e.target.value)}
                placeholder="Ex: Rua das Flores, 100 — Centro" className={inputCls} />
            </div>
            <div className="flex justify-end pt-1">
              <button onClick={save} disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sage-400 text-white rounded-full text-sm font-medium hover:bg-sage-500 disabled:opacity-50 shadow-soft">
                {saving && <Loader2 size={14} className="animate-spin" />}
                Salvar
              </button>
            </div>
          </div>
        </div>

        {/* Teste de envio */}
        {status === "connected" && (
          <div className="bg-white border border-sage-100 rounded-3xl p-6">
            <h3 className="font-display text-base text-ink-700 mb-1">Testar envio</h3>
            <p className="text-xs text-ink-400 mb-4">Envia uma mensagem para verificar se está funcionando.</p>
            <div className="flex gap-3">
              <input value={testPhone} onChange={e => setTestPhone(e.target.value)}
                placeholder="(11) 99999-9999" inputMode="tel" className={`${inputCls} flex-1`} />
              <button onClick={testMessage} disabled={testing || !testPhone.trim()}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded-full text-sm font-medium hover:bg-[#1ebc5a] disabled:opacity-50 shadow-soft shrink-0">
                {testing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Enviar
              </button>
            </div>
            {testResult && (
              <div className={`mt-3 flex items-center gap-2 text-sm ${testResult === "sent" ? "text-sage-600" : "text-rose-400"}`}>
                {testResult === "sent"
                  ? <><CheckCircle2 size={16} /> Mensagem enviada!</>
                  : <><XCircle size={16} /> Falha ao enviar.</>}
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="bg-cream-50 border border-sage-100 rounded-3xl p-5 text-xs text-ink-500 space-y-1.5">
          <p className="font-medium text-ink-700 mb-2">Como funciona</p>
          <p>📱 Escaneie o QR code com o WhatsApp do número da clínica</p>
          <p>📅 Todo dia às 08:00 o sistema busca consultas do dia seguinte</p>
          <p>💬 Envia mensagem com nome, serviço, horário e link de confirmação</p>
          <p>✅ O paciente confirma respondendo <strong>SIM</strong> ou clicando no link</p>
          <p className="pt-1 text-[11px] text-ink-400">Powered by <strong>Baileys</strong> — conexão direta com WhatsApp Web, sem custos adicionais.</p>
        </div>

        {/* API Keys */}
        <ApiKeysSection />
      </div>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: WaStatus }) {
  if (status === "connected") return (
    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#25D366]/10 text-[#25D366] font-medium">
      <Wifi size={12} /> Conectado
    </span>
  );
  if (status === "connecting") return (
    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-600 font-medium">
      <Loader2 size={12} className="animate-spin" /> Conectando
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-400 font-medium">
      <WifiOff size={12} /> Desconectado
    </span>
  );
}

function QrImage({ qr }: { qr: string }) {
  // Gera imagem do QR via API pública
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qr)}`;
  return (
    <div className="border-4 border-white shadow-soft rounded-2xl overflow-hidden">
      <Image src={url} alt="QR Code WhatsApp" width={220} height={220} unoptimized />
    </div>
  );
}
