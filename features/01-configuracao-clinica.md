# Feature: Configuração da Clínica

## O que a feature faz (Frontend Admin)
Fornece as telas para o dentista gerenciar as tabelas base do sistema: Serviços oferecidos, Horários de expediente da clínica e personalização das perguntas da anamnese.

## Telas a serem desenvolvidas
- **Página de Serviços**: Tabela listando serviços e modais de Cadastro/Edição.
- **Página de Horários**: Grid ou formulário onde o dentista marca os dias da semana que atende e os intervalos (ex: Seg a Sex, 08:00 - 12:00, 14:00 - 18:00).
- **Página de Formulário (Anamnese)**: Builder simples onde o dentista pode adicionar perguntas customizadas (ex: "Tem alergia a algo?", "Toma algum remédio?").

## Endpoints consumidos
- `GET/POST/PUT /api/services` (do AgendamentoOdonto-Back)
- `GET/POST /api/schedules`
- `POST /api/form-settings`
