import React, { useState } from "react";

export function AnamnesisFormBuilderPage() {
  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);

  return (
    <section>
      <h1>Formulário de Anamnese</h1>
      <label htmlFor="new-question">Nova pergunta</label>
      <input id="new-question" value={question} onChange={(event) => setQuestion(event.target.value)} />
      <button
        type="button"
        onClick={() => {
          if (!question.trim()) return;
          setQuestions((current) => [...current, question]);
          setQuestion("");
        }}
      >
        Adicionar pergunta
      </button>
      <ul>
        {questions.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
