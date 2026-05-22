# Feature: Histórico do Paciente

## O que a feature faz (Frontend Admin)
Apresenta o painel individual (360 graus) do paciente para que o dentista estude o caso clínico rapidamente.

## Telas a serem desenvolvidas
- **Lista de Pacientes**: Tabela global com pesquisa por CPF ou Nome.
- **Dashboard do Paciente (Perfil)**:
    - Card com os dados pessoais.
    - Componente de Linha do Tempo (Timeline) mostrando o histórico cronológico de tudo que aconteceu: agendamentos passados, faltas, prontuários de acompanhamento (ex: Prontuário #001, #002) e documentos assinados.

## Endpoints consumidos
- `GET /api/patients`
- `GET /api/patients/{id}/profile`
- `GET /api/patients/{id}/timeline`
