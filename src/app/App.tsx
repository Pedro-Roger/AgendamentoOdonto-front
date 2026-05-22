import React from "react";
import { SignatureModal } from "../features/assinatura/SignatureModal";
import { AnamnesisFormBuilderPage } from "../features/configuracao-clinica/AnamnesisFormBuilderPage";
import { SchedulesPage } from "../features/configuracao-clinica/SchedulesPage";
import { ServicesPage } from "../features/configuracao-clinica/ServicesPage";
import { PatientHistoryPage } from "../features/historico-paciente/PatientHistoryPage";
import { ClinicalAttendancePage } from "../features/prontuario-digital/ClinicalAttendancePage";
import "./app.css";

function pageFromPath(pathname: string) {
  if (pathname === "/admin/prontuario") return "prontuario";
  if (pathname === "/admin/assinatura") return "assinatura";
  if (pathname === "/admin/historico-paciente") return "historico";
  if (pathname === "/admin/horarios") return "horarios";
  if (pathname === "/admin/anamnese") return "anamnese";
  return "servicos";
}

export function App() {
  const page = pageFromPath(window.location.pathname);

  const isDashboard = page === "servicos";
  const isActive = (href: string) => (window.location.pathname === href || (href === "/admin" && window.location.pathname === "/admin") ? "active" : "");

  return (
    <main className="admin-shell">
      <section className="admin-frame">
        <aside className="admin-sidebar">
          <div className="brand">Odonto</div>
          <div className="menu-title">MENU</div>
          <nav aria-label="Admin menu">
            <a className={isActive("/admin")} href="/admin">Dashboard</a>
            <a className={isActive("/admin/horarios")} href="/admin/horarios">Tasks</a>
            <a className={isActive("/admin/anamnese")} href="/admin/anamnese">Calendar</a>
            <a className={isActive("/admin/prontuario")} href="/admin/prontuario">Analytics</a>
            <a className={isActive("/admin/assinatura")} href="/admin/assinatura">Team</a>
            <a className={isActive("/admin/historico-paciente")} href="/admin/historico-paciente">Settings</a>
          </nav>
          <div className="bottom-banner">
            <p style={{ margin: 0 }}>Download our mobile app</p>
            <button className="btn" style={{ marginTop: 10, color: "#fff", borderColor: "#fff", background: "transparent" }}>Download</button>
          </div>
        </aside>

        <section className="admin-main">
          <header className="topbar">
            <input className="search" placeholder="Buscar tarefa, paciente, agenda..." />
            <strong>Dr. Admin</strong>
          </header>

          {isDashboard ? (
            <>
              <section className="hero">
                <div>
                  <h1>Dashboard</h1>
                  <p>Plan, prioritize, and accomplish your tasks with ease.</p>
                </div>
                <div className="actions">
                  <button className="btn primary">Add Project</button>
                  <button className="btn">Export Data</button>
                </div>
              </section>

              <section className="grid">
                <article className="card green">
                  <h3>Total Projects</h3>
                  <p className="stat">24</p>
                </article>
                <article className="card">
                  <h3>Ended Projects</h3>
                  <p className="stat">10</p>
                </article>
                <article className="card">
                  <h3>Running Projects</h3>
                  <p className="stat">12</p>
                </article>
                <article className="card">
                  <h3>Pending Project</h3>
                  <p className="stat">2</p>
                </article>
              </section>

              <section className="rows">
                <article className="card card-large">
                  <h3>Project Analytics</h3>
                  <ServicesPage services={[{ id: "1", name: "Consulta inicial", price: 120 }]} />
                </article>
                <article className="card">
                  <h3>Lembretes</h3>
                  <ul className="list">
                    <li>Revisar agenda da tarde</li>
                    <li>Confirmar retorno do João</li>
                    <li>Assinar prontuário pendente</li>
                  </ul>
                </article>
                <article className="time-card">
                  <h3 style={{ margin: 0 }}>Time Tracker</h3>
                  <p className="time">01:24:08</p>
                </article>
              </section>
            </>
          ) : null}

          {page === "horarios" && <SchedulesPage onSave={() => undefined} />}
          {page === "anamnese" && <AnamnesisFormBuilderPage />}
          {page === "prontuario" && (
            <ClinicalAttendancePage
              previousRecords={[{ id: "pr1", label: "Consulta anterior" }]}
              onDuplicateFromPrevious={() => undefined}
              onUploadAttachment={() => undefined}
            />
          )}
          {page === "assinatura" && <SignatureModal onSubmitPhysical={() => undefined} onGenerateElectronicLink={() => undefined} />}
          {page === "historico" && (
            <PatientHistoryPage
              patients={[{ id: "p1", name: "Maria Souza", cpf: "11122233344" }]}
              timelineByPatient={{ p1: ["Consulta em 2026-05-01", "Retorno em 2026-05-10"] }}
            />
          )}
        </section>
      </section>
    </main>
  );
}
