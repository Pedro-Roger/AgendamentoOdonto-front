"use client";

import { useEffect, useState } from "react";
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
  Eye,
  EyeOff,
} from "lucide-react";
import { adminApi } from "@/src/lib/frontend-api";

const inputCls =
  "w-full px-3.5 py-2.5 bg-cream-50 border border-sage-100 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:bg-white transition-all";

export default function IntegracoesPage() {
  const [instanceId, setInstanceId] = useState("");
  const [token, setToken] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [showToken, setShowToken] = useState(false);

  const [testPhone, setTestPhone] = useState("");
  const [testResult, setTestResult] = useState<"sent" | "failed" | null>(null);
  const [testing, setTesting] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getWhatsAppConfig()
      .then((cfg: any) => {
        if (!cfg) return;
        setInstanceId(cfg.instanceId ?? "");
        setToken(cfg.token ?? "");
        setClinicName(cfg.clinicName ?? "");
        setClinicAddress(cfg.clinicAddress ?? "");
        setIsActive(cfg.isActive ?? true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setError(null);
    setSuccess(null);
    if (!instanceId.trim() || !token.trim() || !clinicName.trim()) {
      setError("Preencha Instance ID, Token e Nome da clínica.");
      return;
    }
    setSaving(true);
    try {
      await adminApi.saveWhatsAppConfig({
        instanceId: instanceId.trim(),
        token: token.trim(),
        clinicName: clinicName.trim(),
        clinicAddress: clinicAddress.trim(),
        isActive,
      });
      setSuccess("Configuração salva com sucesso.");
    } catch (e: any) {
      setError(e?.message ?? "Erro ao salvar.");
    } finally {
      setSaving(false);
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
        {/* WhatsApp card */}
        <div className="bg-white border border-sage-100 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-[#25D366]/10 flex items-center justify-center">
              <MessageCircle size={20} className="text-[#25D366]" />
            </div>
            <div>
              <h2 className="font-display text-xl text-ink-700">WhatsApp (Z-API)</h2>
              <p className="text-xs text-ink-400 mt-0.5">
                Lembretes automáticos 24h antes da consulta
              </p>
            </div>
            <div className="ml-auto">
              <span
                className={`text-xs px-2.5 py-1 rounded-full ${
                  isActive
                    ? "bg-sage-100 text-sage-600"
                    : "bg-rose-100 text-rose-400"
                }`}
              >
                {isActive ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2.5 px-3.5 py-3 rounded-2xl bg-rose-100 border border-rose-200 text-rose-400 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 px-3.5 py-3 rounded-2xl bg-sage-100 border border-sage-200 text-sage-600 text-sm">
              {success}
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-2 text-ink-400 text-sm py-4">
              <Loader2 size={16} className="animate-spin" /> Carregando...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-ink-500 mb-1.5">
                    Instance ID <span className="text-rose-400">*</span>
                  </label>
                  <input
                    value={instanceId}
                    onChange={(e) => setInstanceId(e.target.value)}
                    placeholder="Ex: 3D5A3B56..."
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-500 mb-1.5">
                    Token <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showToken ? "text" : "password"}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Token de autenticação Z-API"
                      className={`${inputCls} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                    >
                      {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-500 mb-1.5">
                  Nome da clínica <span className="text-rose-400">*</span>
                </label>
                <input
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="Ex: Clínica Sorriso"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-500 mb-1.5">
                  Endereço da clínica
                </label>
                <input
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                  placeholder="Ex: Rua das Flores, 100 — Centro, São Paulo"
                  className={inputCls}
                />
                <p className="text-[11px] text-ink-400 mt-1">
                  Aparece na mensagem de lembrete enviada ao paciente.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="wpp-active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="wpp-active" className="text-sm text-ink-600">
                  Ativar envio automático de lembretes
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={save}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-sage-400 text-white rounded-full text-sm font-medium hover:bg-sage-500 disabled:opacity-50 shadow-soft"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                  Salvar configuração
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Teste de envio */}
        <div className="bg-white border border-sage-100 rounded-3xl p-6">
          <h3 className="font-display text-base text-ink-700 mb-1">Testar envio</h3>
          <p className="text-xs text-ink-400 mb-4">
            Envia uma mensagem de teste para verificar se a integração está funcionando.
          </p>
          <div className="flex gap-3">
            <input
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              inputMode="tel"
              className={`${inputCls} flex-1`}
            />
            <button
              onClick={testMessage}
              disabled={testing || !testPhone.trim()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded-full text-sm font-medium hover:bg-[#1ebc5a] disabled:opacity-50 shadow-soft shrink-0"
            >
              {testing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              Enviar teste
            </button>
          </div>
          {testResult && (
            <div
              className={`mt-3 flex items-center gap-2 text-sm ${
                testResult === "sent" ? "text-sage-600" : "text-rose-400"
              }`}
            >
              {testResult === "sent" ? (
                <>
                  <CheckCircle2 size={16} /> Mensagem enviada com sucesso!
                </>
              ) : (
                <>
                  <XCircle size={16} /> Falha ao enviar. Verifique as credenciais.
                </>
              )}
            </div>
          )}
        </div>

        {/* Info sobre o fluxo */}
        <div className="bg-cream-50 border border-sage-100 rounded-3xl p-5 text-xs text-ink-500 space-y-1.5">
          <p className="font-medium text-ink-700 mb-2">Como funciona</p>
          <p>📅 Todo dia às 08:00 o sistema busca consultas do dia seguinte</p>
          <p>📱 Envia mensagem via WhatsApp com nome, serviço, horário e endereço</p>
          <p>✅ O paciente pode confirmar respondendo <strong>SIM</strong> ou clicando no link</p>
          <p>❌ Para cancelar, o paciente responde <strong>NÃO</strong></p>
          <p className="pt-1 text-[11px] text-ink-400">
            Powered by{" "}
            <a href="https://z-api.io" target="_blank" rel="noreferrer" className="underline">
              Z-API
            </a>{" "}
            — é necessário ter uma instância Z-API ativa com WhatsApp conectado.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
