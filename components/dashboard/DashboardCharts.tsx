"use client";

import type { DashboardSummary } from "@/src/lib/frontend-api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PALETTE = ["#7BA890", "#E8A87C", "#D98C9A", "#A7C4B5", "#F0C9A8"];

const SOURCE_LABELS: Record<string, string> = {
  INTERNAL: "Interno",
  PUBLIC: "Página pública",
  INTEGRATION: "Site integrado",
};

const brl = (v: number) =>
  v === 0
    ? "—"
    : new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(v);

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-sage-100 rounded-3xl p-5 hover:shadow-soft transition-shadow animate-fadeUp dark:bg-ink-800 dark:border-ink-700">
      <div className="font-display text-2xl lg:text-3xl text-ink-700 leading-none mb-1 dark:text-cream-100">
        {value}
      </div>
      <div className="text-sm text-ink-500 mt-2 dark:text-ink-400">{label}</div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-sage-100 rounded-3xl p-6 animate-fadeUp dark:bg-ink-800 dark:border-ink-700">
      <h2 className="font-display text-lg text-ink-700 mb-4 dark:text-cream-100">{title}</h2>
      {children}
    </div>
  );
}

function EmptyHint() {
  return (
    <div className="text-sm text-ink-400 py-10 text-center">
      Sem dados no período
    </div>
  );
}

export function DashboardCharts({
  summary,
}: {
  summary: DashboardSummary | null;
}) {
  if (!summary) {
    return (
      <div className="space-y-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-white border border-sage-100 rounded-3xl p-5 h-24 animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-sage-100 rounded-3xl p-6 h-72 animate-pulse" />
          <div className="bg-white border border-sage-100 rounded-3xl p-6 h-72 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Kpi label="Consultas no período" value={String(summary.totalAppointments)} />
        <Kpi label="Pacientes novos" value={String(summary.newPatients)} />
        <Kpi label="Receita" value={brl(summary.revenue)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Consultas por dia">
          {summary.appointmentsByDay.length === 0 ? (
            <EmptyHint />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary.appointmentsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE7DF" />
                  <XAxis dataKey="date" stroke="#9A9286" fontSize={12} />
                  <YAxis stroke="#9A9286" fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#7BA890"
                    strokeWidth={2.5}
                    dot={{ fill: "#7BA890" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Por serviço">
          {summary.appointmentsByService.length === 0 ? (
            <EmptyHint />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Pie
                    data={summary.appointmentsByService}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(e: any) => e.name}
                  >
                    {summary.appointmentsByService.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <Card title="Por origem">
        {summary.appointmentsBySource.length === 0 ? (
          <EmptyHint />
        ) : (
          <ul className="space-y-2">
            {summary.appointmentsBySource.map((s) => (
              <li
                key={s.source}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-cream-100 transition-colors"
              >
                <span className="text-sm text-ink-600">
                  {SOURCE_LABELS[s.source] ?? s.source}
                </span>
                <span className="font-display text-lg text-ink-700">
                  {s.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
