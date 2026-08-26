import { describe, it, expect, vi, beforeEach } from 'vitest';
beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => '[]' }) as any;
});
import { publicApi, dashboardApi, apiKeysApi, adminApi } from '../src/lib/frontend-api';
describe('frontend-api multi-tenancy', () => {
  it('publicApi usa o slug', async () => {
    await publicApi.services('dra-herlania');
    expect((global.fetch as any).mock.calls[0][0]).toContain('api/public/dra-herlania/services');
  });
  it('publicApi.createAppointment usa o slug', async () => {
    await publicApi.createAppointment('dra-herlania', { name:'A',cpf:'1',email:'a@b.com',phone:'9',serviceId:'s1',date:'2026-06-18',time:'09:00',anamnesisAnswers:[] });
    const call = (global.fetch as any).mock.calls[0];
    expect(call[0]).toContain('api/public/dra-herlania/appointments');
    expect(call[1].method).toBe('POST');
  });
  it('publicApi.availability chama a rota pública real do backend', async () => {
    await publicApi.availability('dra-herlania', 's1', '2026-06-18');
    expect((global.fetch as any).mock.calls[0][0]).toContain('api/public/dra-herlania/available-schedules?serviceId=s1&date=2026-06-18');
  });
  it('dashboardApi.summary monta from/to', async () => {
    await dashboardApi.summary('2026-06-01', '2026-06-30');
    expect((global.fetch as any).mock.calls[0][0]).toContain('api/dashboard?from=2026-06-01&to=2026-06-30');
  });
  it('apiKeysApi.list chama api/api-keys', async () => {
    await apiKeysApi.list();
    expect((global.fetch as any).mock.calls[0][0]).toContain('api/api-keys');
  });
  it('adminApi.availability chama a rota autenticada', async () => {
    await adminApi.availability('s1', '2026-06-18');
    expect((global.fetch as any).mock.calls[0][0]).toContain('api/appointments/availability?serviceId=s1&date=2026-06-18');
  });
  it('adminApi.createAppointment faz POST em api/appointments', async () => {
    await adminApi.createAppointment({ name:'A',cpf:'1',email:'a@b.com',phone:'9',serviceId:'s1',date:'2026-06-18',time:'09:00',anamnesisAnswers:[] });
    const call = (global.fetch as any).mock.calls[0];
    expect(call[0]).toContain('api/appointments');
    expect(call[1].method).toBe('POST');
  });
  it('adminApi.deletePatient remove paciente por id', async () => {
    await adminApi.deletePatient('p1');
    const call = (global.fetch as any).mock.calls[0];
    expect(call[0]).toContain('api/patients/p1');
    expect(call[1].method).toBe('DELETE');
  });
});
