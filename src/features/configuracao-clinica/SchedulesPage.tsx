import React, { useState } from "react";

type Schedule = {
  day: string;
  start: string;
  end: string;
};

type SchedulesPageProps = {
  onSave: (schedule: Schedule) => void;
};

export function SchedulesPage({ onSave }: SchedulesPageProps) {
  const [day, setDay] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  return (
    <section>
      <h1>Horários</h1>
      <label htmlFor="schedule-day">Dia</label>
      <input id="schedule-day" value={day} onChange={(event) => setDay(event.target.value)} />
      <label htmlFor="schedule-start">Início</label>
      <input id="schedule-start" value={start} onChange={(event) => setStart(event.target.value)} />
      <label htmlFor="schedule-end">Fim</label>
      <input id="schedule-end" value={end} onChange={(event) => setEnd(event.target.value)} />
      <button type="button" onClick={() => onSave({ day, start, end })}>Salvar horário</button>
    </section>
  );
}
