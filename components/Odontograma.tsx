"use client";

import { useState } from "react";

export type OdontogramaEstado =
  | "saudavel"
  | "restaurado"
  | "cariado"
  | "extraido"
  | "tratamento";

export type OdontogramaState = Record<number, OdontogramaEstado>;

// Notação FDI (universal)
const superiorDireito = [18, 17, 16, 15, 14, 13, 12, 11];
const superiorEsquerdo = [21, 22, 23, 24, 25, 26, 27, 28];
const inferiorEsquerdo = [31, 32, 33, 34, 35, 36, 37, 38];
const inferiorDireito = [48, 47, 46, 45, 44, 43, 42, 41];

type Estado = OdontogramaEstado;

const estadoCor: Record<Estado, { bg: string; border: string; label: string }> = {
  saudavel: { bg: "fill-white", border: "stroke-sage-200", label: "Saudável" },
  restaurado: { bg: "fill-sage-200", border: "stroke-sage-400", label: "Restaurado" },
  cariado: { bg: "fill-peach-200", border: "stroke-peach-400", label: "Cárie" },
  extraido: { bg: "fill-cream-200", border: "stroke-ink-400", label: "Extraído" },
  tratamento: { bg: "fill-rose-200", border: "stroke-rose-400", label: "Em tratamento" },
};

const estadosIniciais: Record<number, Estado> = {};

function Dente({
  numero,
  estado,
  onClick,
  inferior = false,
}: {
  numero: number;
  estado: Estado;
  onClick: () => void;
  inferior?: boolean;
}) {
  const cor = estadoCor[estado];
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 group ${inferior ? "flex-col-reverse" : ""}`}
    >
      <span className="text-[9px] text-ink-400 group-hover:text-ink-700 font-mono">
        {numero}
      </span>
      <svg
        width="28"
        height="36"
        viewBox="0 0 28 36"
        className={`transition-transform group-hover:scale-110 ${inferior ? "rotate-180" : ""}`}
      >
        {/* Coroa */}
        <path
          d="M4 4 Q4 0 8 0 L20 0 Q24 0 24 4 L24 18 Q24 22 20 22 L8 22 Q4 22 4 18 Z"
          className={`${cor.bg} ${cor.border}`}
          strokeWidth="1.5"
        />
        {/* Raiz */}
        <path
          d="M10 22 L8 34 Q8 36 10 36 L12 36 L13 24 Z"
          className={`${cor.bg} ${cor.border}`}
          strokeWidth="1.5"
        />
        <path
          d="M18 22 L20 34 Q20 36 18 36 L16 36 L15 24 Z"
          className={`${cor.bg} ${cor.border}`}
          strokeWidth="1.5"
        />
        {estado === "extraido" && (
          <line
            x1="4"
            y1="4"
            x2="24"
            y2="32"
            className="stroke-ink-400"
            strokeWidth="1.5"
          />
        )}
      </svg>
    </button>
  );
}

export function Odontograma({
  value,
  onChange,
  readOnly = false,
}: {
  value?: OdontogramaState;
  onChange?: (next: OdontogramaState) => void;
  readOnly?: boolean;
} = {}) {
  const [internal, setInternal] = useState<OdontogramaState>(estadosIniciais);
  const controlled = value !== undefined;
  const estados = controlled ? (value as OdontogramaState) : internal;

  const ciclar = (n: number) => {
    if (readOnly) return;
    const ordem: Estado[] = [
      "saudavel",
      "restaurado",
      "cariado",
      "tratamento",
      "extraido",
    ];
    const atual = estados[n] || "saudavel";
    const idx = (ordem.indexOf(atual) + 1) % ordem.length;
    const next = { ...estados, [n]: ordem[idx] };
    if (!controlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <div className="bg-cream-50 border border-sage-100 rounded-2xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h4 className="text-sm font-medium text-ink-700">Odontograma</h4>
        <div className="flex items-center gap-3 text-[10px] flex-wrap">
          {Object.entries(estadoCor).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <div
                className={`w-3 h-3 rounded ${v.bg.replace("fill-", "bg-")} border ${v.border.replace("stroke-", "border-")}`}
              ></div>
              <span className="text-ink-500">{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 overflow-x-auto">
        {/* Arcada superior */}
        <div className="flex justify-center gap-1.5 pb-2 border-b border-dashed border-sage-200 min-w-[540px]">
          {superiorDireito.map((n) => (
            <Dente
              key={n}
              numero={n}
              estado={estados[n] || "saudavel"}
              onClick={() => ciclar(n)}
            />
          ))}
          <div className="w-3"></div>
          {superiorEsquerdo.map((n) => (
            <Dente
              key={n}
              numero={n}
              estado={estados[n] || "saudavel"}
              onClick={() => ciclar(n)}
            />
          ))}
        </div>

        {/* Arcada inferior - invertida */}
        <div className="flex justify-center gap-1.5 pt-2 min-w-[540px]">
          {inferiorDireito.map((n) => (
            <Dente
              key={n}
              numero={n}
              estado={estados[n] || "saudavel"}
              onClick={() => ciclar(n)}
              inferior
            />
          ))}
          <div className="w-3"></div>
          {inferiorEsquerdo.map((n) => (
            <Dente
              key={n}
              numero={n}
              estado={estados[n] || "saudavel"}
              onClick={() => ciclar(n)}
              inferior
            />
          ))}
        </div>
      </div>

      <p className="text-[10px] text-ink-400 text-center mt-4">
        Clique em qualquer dente para alterar o estado
      </p>
    </div>
  );
}
