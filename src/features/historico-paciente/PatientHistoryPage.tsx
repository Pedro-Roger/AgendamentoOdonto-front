import React, { useMemo, useState } from "react";

type Patient = {
  id: string;
  name: string;
  cpf: string;
};

type PatientHistoryPageProps = {
  patients: Patient[];
  timelineByPatient: Record<string, string[]>;
};

export function PatientHistoryPage({ patients, timelineByPatient }: PatientHistoryPageProps) {
  const [query, setQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const filteredPatients = useMemo(
    () => patients.filter((patient) => (patient.name + patient.cpf).toLowerCase().includes(query.toLowerCase())),
    [patients, query]
  );

  return (
    <section>
      <h1>Histórico do Paciente</h1>
      <label htmlFor="patient-search">Buscar paciente</label>
      <input id="patient-search" value={query} onChange={(event) => setQuery(event.target.value)} />

      <ul>
        {filteredPatients.map((patient) => (
          <li key={patient.id}>
            <span>{patient.name}</span>
            <button type="button" onClick={() => setSelectedPatientId(patient.id)}>
              Ver perfil {patient.name}
            </button>
          </li>
        ))}
      </ul>

      <div>
        {(selectedPatientId ? timelineByPatient[selectedPatientId] : []).map((event) => (
          <p key={event}>{event}</p>
        ))}
      </div>
    </section>
  );
}
