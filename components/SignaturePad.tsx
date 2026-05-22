"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser, Check, Loader2, MapPin } from "lucide-react";

type Props = { token: string };

export function SignaturePad({ token }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = "#136E89";
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(last.current!.x, last.current!.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (!hasInk) setHasInk(true);
  }

  function end() {
    drawing.current = false;
    last.current = null;
  }

  function clear() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  }

  async function getGeo(): Promise<{ latitude: number | null; longitude: number | null }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ latitude: null, longitude: null });
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
        () => resolve({ latitude: null, longitude: null }),
        { timeout: 5000 }
      );
    });
  }

  async function submit() {
    if (!hasInk || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const dataUrl = canvasRef.current!.toDataURL("image/png");
      const imageBase64 = dataUrl.split(",")[1];
      const geo = await getGeo();
      const res = await fetch(`/api/backend/api/public/signatures/electronic/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, latitude: geo.latitude, longitude: geo.longitude }),
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : null;
      if (!res.ok) throw new Error(data?.message ?? `Erro ${res.status}`);
      setDone(true);
    } catch (e: any) {
      setError(e.message ?? "Erro ao enviar assinatura");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 rounded-full bg-sage-200 text-sage-600 flex items-center justify-center mx-auto mb-5">
          <Check size={32} strokeWidth={2.4} />
        </div>
        <h2 className="font-display text-2xl text-ink-700 mb-2">Assinatura registrada</h2>
        <p className="text-sm text-ink-500 max-w-sm mx-auto">
          Documento assinado eletronicamente. Você pode fechar esta janela com segurança.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-cream-50 border-2 border-dashed border-sage-200 rounded-2xl overflow-hidden">
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="w-full h-64 touch-none cursor-crosshair block"
        />
      </div>
      <p className="text-[11px] text-ink-400 mt-2 flex items-center gap-1">
        <MapPin size={10} />
        Sua localização e IP serão registrados como prova de autenticidade.
      </p>

      {error && (
        <div className="mt-4 text-xs text-rose-400 bg-rose-100 rounded-2xl px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button
          onClick={clear}
          disabled={!hasInk || submitting}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm text-ink-500 bg-cream-100 hover:bg-cream-200 disabled:opacity-40"
        >
          <Eraser size={16} /> Limpar
        </button>
        <button
          onClick={submit}
          disabled={!hasInk || submitting}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium bg-sage-400 text-white hover:bg-sage-500 disabled:opacity-50 shadow-soft"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          Confirmar assinatura
        </button>
      </div>
    </>
  );
}
