import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("recharts", () => {
  const Passthrough = ({ children }: any) => <div>{children}</div>;
  return {
    ResponsiveContainer: Passthrough,
    LineChart: Passthrough,
    Line: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    CartesianGrid: () => null,
    PieChart: Passthrough,
    Pie: () => null,
    Cell: () => null,
    Legend: () => null,
  };
});

import { DashboardCharts } from "../components/dashboard/DashboardCharts";

const mock = {
  totalAppointments: 12,
  newPatients: 3,
  revenue: 0,
  appointmentsByDay: [{ date: "2026-06-16", count: 2 }],
  appointmentsByService: [{ name: "Limpeza", count: 5 }],
  appointmentsBySource: [
    { source: "INTERNAL", count: 4 },
    { source: "INTEGRATION", count: 8 },
  ],
  upcomingToday: 1,
};

describe("DashboardCharts", () => {
  it("renders KPIs, chart titles and source labels", () => {
    render(<DashboardCharts summary={mock} />);

    expect(screen.getByText("Consultas por dia")).toBeInTheDocument();
    expect(screen.getByText("Por serviço")).toBeInTheDocument();
    expect(screen.getByText("Por origem")).toBeInTheDocument();

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    expect(screen.getByText("Site integrado")).toBeInTheDocument();
  });

  it("renders loading state when summary is null", () => {
    const { container } = render(<DashboardCharts summary={null} />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
