# Multi-Tenancy Frontend + UX Implementation Plan (Plano 2 de 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Adaptar o frontend ao backend multi-tenant, adicionar dashboard com gráficos, página pública de agendamento por slug, gestão de API Keys, dark mode e onboarding de nova compania.

**Architecture:** Next.js App Router. Painel autenticado fala com o backend via proxy `/api/backend/[...path]` (cookie de sessão carrega o JWT, que já inclui `tenantId` — isolamento é automático). Rotas públicas usam `:slug` para identificar a compania. Frontend testado com Vitest + Testing Library.

**Tech Stack:** Next.js, React, Tailwind, recharts (já instalado), lucide-react, Vitest.

**Contexto do estado atual (verificado):**
- `app/dashboard/page.tsx` — real, cards simples, SEM recharts, NÃO usa endpoint de dashboard.
- `app/agenda/page.tsx` — **já é um calendário semanal completo** usando `adminApi.listAppointmentsWeek`. Funciona com isolamento automático. Só recebe um retoque (criar consulta ao clicar em slot vazio) — opcional.
- `app/configuracoes/integracoes/page.tsx` — só WhatsApp. Precisa de uma seção de API Keys.
- Agendamento: `components/NewAppointmentModal.tsx` usa `publicApi` (rotas antigas SEM slug) — **quebrado** pelo backend novo.
- Dark mode: inexistente. `tailwind.config.ts` sem `darkMode`.
- Sessão: cookie httpOnly `odonto_session` com `{ sub, name, email, role, accessToken }`. `/api/session/me` expõe `{ user }` ao cliente. `components/Sidebar.tsx` filtra nav por `role`.
- Proxy: `app/api/backend/[...path]/route.ts` injeta `Authorization: Bearer <accessToken>`.

---

## Task 1 (BACKEND addendum): endpoint autenticado de criação de consulta

**Repo:** AgendamentoOdonto-Back (branch feat/multi-tenancy). O staff logado precisa criar consulta no SEU tenant sem passar por slug público. Hoje não existe rota autenticada de create.

**Files:**
- Modify: `src/appointments/appointments.controller.ts`
- Modify: `src/appointments/appointments.service.ts`
- Modify: `src/appointments/appointments.module.ts` (se precisar do PatientAppointmentsService) — preferir reusar a lógica existente.
- Test: `src/appointments/appointments.controller.spec.ts`

- [ ] **Step 1: Teste que falha**

```ts
import { AppointmentsController } from './appointments.controller';

const mockService = {
  findByDateRange: jest.fn(),
  listByDate: jest.fn(),
  createInternal: jest.fn().mockResolvedValue({ id: 'a1' }),
};
function makeController() { return new AppointmentsController(mockService as any); }

describe('AppointmentsController — criação interna', () => {
  it('cria consulta no tenant do usuário com source INTERNAL', async () => {
    const user = { tenantId: 't1' } as any;
    const dto: any = { name: 'A', cpf: '1', email: 'a@b.com', phone: '9', serviceId: 's1', date: '2026-06-18', time: '09:00', anamnesisAnswers: [] };
    await makeController().create(user, dto);
    expect(mockService.createInternal).toHaveBeenCalledWith('t1', dto);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar** — `npm test -- appointments.controller.spec.ts`

- [ ] **Step 3: Implementar**

Em `AppointmentsService` adicionar `createInternal(tenantId, payload)` que delega ao `PatientAppointmentsService.createAppointment(tenantId, payload, 'INTERNAL')` (injetar PatientAppointmentsService, ou mover a lógica para um método compartilhado). Em `AppointmentsController` adicionar:
```ts
@Post()
@Roles('MASTER','ADMIN','DENTISTA','RECEPCIONISTA')
create(@CurrentUser() user: JwtPayload, @Body() body: CreateAppointmentDto) {
  return this.appointmentsService.createInternal(user.tenantId, body);
}
```
Garantir guards `JwtAuthGuard, RolesGuard` no controller. Reusar o `CreateAppointmentDto` de patient-appointments (ou criar um equivalente).

- [ ] **Step 4: Rodar e ver passar.** **Step 5: `npm test` + `npm run build`. Commit:** "feat(appointments): criação autenticada de consulta interna por tenant"

---

## Task 2: Camada de API do frontend (frontend-api.ts)

**Files:**
- Modify: `src/lib/frontend-api.ts`
- Test: `tests/frontend-api-multitenancy.test.ts`

- [ ] **Step 1: Teste que falha** (valida as URLs construídas)

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => '[]' }) as any;
});

import { publicApi, dashboardApi, apiKeysApi } from '../src/lib/frontend-api';

describe('frontend-api multi-tenancy', () => {
  it('publicApi usa o slug nas rotas públicas', async () => {
    await publicApi.services('dra-herlania');
    expect((global.fetch as any).mock.calls[0][0]).toContain('api/public/dra-herlania/services');
  });
  it('dashboardApi.summary monta from/to', async () => {
    await dashboardApi.summary('2026-06-01', '2026-06-30');
    expect((global.fetch as any).mock.calls[0][0]).toContain('api/dashboard?from=2026-06-01&to=2026-06-30');
  });
  it('apiKeysApi.list chama api/api-keys', async () => {
    await apiKeysApi.list();
    expect((global.fetch as any).mock.calls[0][0]).toContain('api/api-keys');
  });
});
```

- [ ] **Step 2: Rodar e ver falhar** — `npx vitest run tests/frontend-api-multitenancy.test.ts`

- [ ] **Step 3: Implementar**

Substituir o `publicApi` antigo por um slug-based e adicionar `dashboardApi` e `apiKeysApi`. Adicionar `createAppointment` autenticado ao `adminApi`:

```ts
export const publicApi = {
  services: (slug: string) => req<ServiceDto[]>(`api/public/${slug}/services`),
  formSettings: (slug: string) => req<{ id: string; fields: FormFieldDto[] }>(`api/public/${slug}/form-settings`),
  availability: (slug: string, serviceId: string, date: string) =>
    req<ScheduleDto[]>(`api/public/${slug}/availability?serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(date)}`),
  createAppointment: (slug: string, body: BookingBody) =>
    req<AppointmentDto>(`api/public/${slug}/appointments`, { method: 'POST', body: JSON.stringify(body) }),
};

export type DashboardSummary = {
  totalAppointments: number;
  newPatients: number;
  revenue: number;
  appointmentsByDay: { date: string; count: number }[];
  appointmentsByService: { name: string; count: number }[];
  appointmentsBySource: { source: string; count: number }[];
  upcomingToday: number;
};

export const dashboardApi = {
  summary: (from: string, to: string) =>
    req<DashboardSummary>(`api/dashboard?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
};

export type ApiKeyDto = {
  id: string; name: string; prefix: string; allowedOrigins: string[];
  lastUsedAt: string | null; revokedAt: string | null; createdAt: string;
};

export const apiKeysApi = {
  list: () => req<ApiKeyDto[]>('api/api-keys'),
  create: (body: { name: string; allowedOrigins: string[] }) =>
    req<ApiKeyDto & { plaintextKey: string }>('api/api-keys', { method: 'POST', body: JSON.stringify(body) }),
  revoke: (id: string) => req(`api/api-keys/${id}`, { method: 'DELETE' }),
};
```

No `adminApi` adicionar:
```ts
  createAppointment: (body: BookingBody) =>
    req<AppointmentDto>('api/appointments', { method: 'POST', body: JSON.stringify(body) }),
```
Definir `type BookingBody = { name: string; cpf: string; email: string; phone: string; serviceId: string; date: string; time: string; reason?: string; anamnesisAnswers: Array<{ key: string; value: string }> }`.

- [ ] **Step 4: Rodar e ver passar.** **Step 5: Commit:** "feat(api): camada slug-based, dashboard e api-keys no frontend"

---

## Task 3: Corrigir NewAppointmentModal (staff usa rota autenticada)

**Files:**
- Modify: `components/NewAppointmentModal.tsx`
- Test: `tests/new-appointment-modal.test.tsx`

- [ ] **Step 1: Teste que falha** — renderiza o modal, preenche, submete, e verifica que chama `adminApi.createAppointment` (não `publicApi`). Mockar `adminApi` (`vi.mock('../src/lib/frontend-api', ...)`) com `listServices`, `createAppointment`, e a disponibilidade. Asserir que após submit `adminApi.createAppointment` foi chamado com o corpo correto.

- [ ] **Step 2: Rodar e ver falhar.**

- [ ] **Step 3: Implementar** — trocar as chamadas internas do modal:
  - disponibilidade de horários: como é staff autenticado, criar `adminApi.availability(serviceId, date)` que bate em `api/appointments`? Não — reusar via uma rota autenticada de disponibilidade. Mais simples: adicionar ao backend (Task 1 addendum) e ao adminApi um `availability(serviceId, date)` autenticado. SE isso aumentar escopo, manter a disponibilidade via uma rota autenticada nova `GET /api/appointments/availability?serviceId=&date=` no controller de appointments (delegando a `getAvailableSchedules(tenantId, serviceId, date)`). Adicionar test no backend.
  - criação: trocar `publicApi.createAppointment(...)` por `adminApi.createAppointment(...)`.

  > Nota: para manter Task 3 focada no frontend, adicionar a rota autenticada de availability como parte da Task 1 (backend addendum). Atualizar a Task 1 para incluir `GET /api/appointments/availability` e o `adminApi.availability` correspondente na Task 2. (Implementador: se já passou da Task 1, faça um pequeno follow-up commit no backend.)

- [ ] **Step 4: Rodar e ver passar.** **Step 5: Commit:** "fix(agendamento): modal interno usa rota autenticada por tenant"

---

## Task 4: Dashboard com gráficos (recharts)

**Files:**
- Modify: `app/dashboard/page.tsx`
- Create: `components/dashboard/DashboardCharts.tsx`
- Test: `tests/dashboard-charts.test.tsx`

- [ ] **Step 1: Teste que falha** — renderizar `DashboardCharts` com dados mock (`appointmentsByDay`, `appointmentsByService`, `appointmentsBySource`) e asserir que os títulos das seções aparecem ("Consultas por dia", "Por serviço", "Por origem") e os KPIs (total, pacientes novos). Mockar `recharts` se necessário (ResponsiveContainer não mede em jsdom): `vi.mock('recharts', ...)` retornando divs simples, ou envolver com largura fixa.

- [ ] **Step 2: Rodar e ver falhar.**

- [ ] **Step 3: Implementar**
  - `DashboardCharts.tsx`: recebe `DashboardSummary`; renderiza 3 KPI cards (Consultas no período, Pacientes novos, Receita — "—" se 0), um `LineChart` (consultas/dia), um `PieChart` (por serviço) e um pequeno bloco de origem (INTERNAL/PUBLIC/INTEGRATION) com contagem. Usar `ResponsiveContainer`.
  - `app/dashboard/page.tsx`: adicionar um seletor de período (7d / 30d) que chama `dashboardApi.summary(from, to)` e passa para `DashboardCharts`. Manter a lista "Agenda de hoje" existente. Calcular `from/to` a partir de `new Date()` no cliente.

- [ ] **Step 4: Rodar e ver passar.** **Step 5: Commit:** "feat(dashboard): KPIs e gráficos por período (recharts)"

---

## Task 5: Página de API Keys nas Integrações

**Files:**
- Create: `components/integracoes/ApiKeysSection.tsx`
- Modify: `app/configuracoes/integracoes/page.tsx` (montar a nova seção abaixo do WhatsApp)
- Test: `tests/api-keys-section.test.tsx`

- [ ] **Step 1: Teste que falha** — render `ApiKeysSection` com `apiKeysApi` mockado (`list` retorna 1 chave; `create` retorna `{ ..., plaintextKey: 'sk_xxx' }`). Asserir: lista mostra `prefix`; ao clicar "Gerar chave" e confirmar, a `plaintextKey` aparece UMA vez num bloco copiável; ao revogar, chama `apiKeysApi.revoke(id)`.

- [ ] **Step 2: Rodar e ver falhar.**

- [ ] **Step 3: Implementar** — `ApiKeysSection`:
  - Lista de chaves (nome, prefix `sk_••••1234`, lastUsedAt, status).
  - Form "Nova chave": nome + domínios permitidos (textarea, um por linha) → `apiKeysApi.create`. Após criar, exibir a `plaintextKey` num bloco destacado com botão copiar e aviso "copie agora, não será mostrada de novo".
  - Botão revogar por linha → `apiKeysApi.revoke`.
  - Bloco "Como integrar": snippet `fetch` pronto, mostrando `POST {origin}/api/integrations/appointments` com header `X-Api-Key: sk_...` e corpo de exemplo. Preencher com a chave recém-criada quando disponível.
  - Montar em `integracoes/page.tsx` abaixo do bloco WhatsApp.

- [ ] **Step 4: Rodar e ver passar.** **Step 5: Commit:** "feat(integracoes): gestão de API Keys + snippet de integração"

---

## Task 6: Página pública de agendamento por slug

**Files:**
- Create: `app/agendar/[slug]/page.tsx`
- Create: `app/agendar/[slug]/BookingForm.tsx` (client component)
- Test: `tests/booking-form.test.tsx`

- [ ] **Step 1: Teste que falha** — render `BookingForm` com `slug="dra-herlania"` e `publicApi` mockado (`services`, `availability`, `createAppointment`). Asserir: carrega serviços; ao escolher serviço+data e clicar buscar horários chama `publicApi.availability('dra-herlania', ...)`; ao submeter chama `publicApi.createAppointment('dra-herlania', body)`.

- [ ] **Step 2: Rodar e ver falhar.**

- [ ] **Step 3: Implementar**
  - `page.tsx` (Server Component): lê `params.slug`, renderiza `<BookingForm slug={slug} />`. Sem auth. Adicionar metadata noindex (reusar `noindex-metadata`).
  - `BookingForm.tsx`: formulário público (nome, CPF mascarado, email, telefone mascarado, serviço, data, horários disponíveis, motivo) reaproveitando a estrutura do `NewAppointmentModal`. Usa `publicApi.*` com o slug. Mostra tela de sucesso após agendar. Se o slug não existir, o backend retorna 404 — exibir mensagem "Clínica não encontrada".

- [ ] **Step 4: Rodar e ver passar.** **Step 5: Commit:** "feat(booking): página pública de agendamento por slug da compania"

---

## Task 7: Dark mode

**Files:**
- Modify: `tailwind.config.ts` (`darkMode: 'class'`)
- Create: `components/ThemeToggle.tsx`
- Create: `src/lib/theme.ts` (helpers de leitura/escrita em localStorage + aplicar classe)
- Modify: `app/layout.tsx` (script inline anti-flash que aplica a classe `dark` antes da hidratação)
- Modify: `components/Topbar.tsx` ou `Sidebar.tsx` (inserir o toggle)
- Test: `tests/theme-toggle.test.tsx`

- [ ] **Step 1: Teste que falha** — render `ThemeToggle`, simular clique, asserir que `document.documentElement.classList` alterna `dark` e que `localStorage` persiste (`theme=dark`/`light`). Mockar `localStorage` via jsdom.

- [ ] **Step 2: Rodar e ver falhar.**

- [ ] **Step 3: Implementar**
  - `tailwind.config.ts`: adicionar `darkMode: 'class'`.
  - `src/lib/theme.ts`: `getTheme()`, `setTheme('dark'|'light')` (escreve localStorage + toggle da classe em `document.documentElement`), `initThemeScript` (string para `<script dangerouslySetInnerHTML>`).
  - `app/layout.tsx`: injetar o script inline no `<head>` que lê `localStorage.theme` (fallback `prefers-color-scheme`) e adiciona a classe `dark` antes do paint (evita flash).
  - `ThemeToggle.tsx`: botão sol/lua (lucide-react) que chama `setTheme`.
  - Inserir o toggle no `Topbar`/`Sidebar`.
  - Adicionar variantes `dark:` aos contêineres principais (`AppShell`, `Sidebar`, `Topbar`, cards do dashboard). Manter conservador: fundo, texto, bordas.

- [ ] **Step 4: Rodar e ver passar.** **Step 5: Commit:** "feat(ux): dark mode com toggle persistente e anti-flash"

---

## Task 8: Onboarding de nova compania

**Files:**
- Create: `app/onboarding/page.tsx` + `OnboardingWizard.tsx`
- Modify: `src/lib/frontend-api.ts` (se necessário: `adminApi.createSchedule/replaceSchedules/createService` já existem)
- Test: `tests/onboarding-wizard.test.tsx`

- [ ] **Step 1: Teste que falha** — render `OnboardingWizard`, 3 passos (Clínica → Horários → 1º Serviço). Asserir navegação entre passos e que no passo final chamar "Concluir" dispara `adminApi.replaceSchedules` e `adminApi.createService`. Mockar `adminApi`.

- [ ] **Step 2: Rodar e ver falhar.**

- [ ] **Step 3: Implementar**
  - `OnboardingWizard.tsx`: stepper de 3 passos. Passo 1: confirma nome da clínica (somente exibe — o tenant já existe via bootstrap). Passo 2: define horários (reusar lógica de `SchedulesPage`). Passo 3: cria o primeiro serviço. "Concluir" persiste e redireciona ao `/dashboard`.
  - `page.tsx`: client wrapper. Acesso protegido (proxy já exige sessão para `/admin`; ajustar matcher se necessário para `/onboarding`).
  - Mostrar o link de onboarding quando o tenant ainda não tem horários/serviços (checar via `adminApi.listSchedules()`/`listServices()` no dashboard e sugerir o wizard se vazios).

- [ ] **Step 4: Rodar e ver passar.** **Step 5: Commit:** "feat(ux): wizard de onboarding de nova compania"

---

## Task 9: Suíte verde + build

- [ ] **Step 1:** `npx vitest run` — todos os testes passam (incluindo os pré-existentes; ajustar minimamente qualquer teste quebrado por mudança de assinatura, preservando intenção).
- [ ] **Step 2:** `npm run build` (Next.js) — build sem erros.
- [ ] **Step 3: Commit:** "chore: frontend multi-tenancy + UX completo (suite verde + build)"

---

## Cobertura do spec
- Isolamento por tenant no painel → automático via JWT/proxy (verificado).
- Booking público por slug → Task 6.
- Integração externa (API Keys + snippet) → Task 5.
- Dashboard com gráficos + origem → Task 4.
- Agenda visual → já existente; sem nova task (retoque opcional de criar-no-slot fica como follow-up).
- Dark mode → Task 7. Onboarding → Task 8. Identidade por tenant (logo/nome no header) → follow-up leve (ler do tenant; registrar se não couber).

## Dependências
- Tasks 1–3 desbloqueiam o agendamento (backend autenticado + api layer + modal).
- Tasks 4/5/6/7/8 são independentes entre si após a Task 2.
