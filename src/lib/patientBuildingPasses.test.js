import { describe, expect, it, vi } from 'vitest'
import { loadPatientBuildingPasses, visibleBuildingPass } from './patientBuildingPasses.js'
const profile = { authUserId: 'own', role: 'patient', linked: true, clinicalId: '42' }
const appointment = { id: 501, patientId: 42, status: 'confirmed', scheduledAt: '2026-10-25T18:00:00-06:00' }
const response = body => ({ ok: true, headers: new Headers({ 'Content-Type': 'application/json' }), json: async () => body })
function fixture() {
  const fetchImpl = vi.fn(async url => url.endsWith('/me') ? response({ profile }) : url.includes('building-pass') ? response({ pass: { state: 'missing' } }) : response({ appointments: [appointment], pagination: { nextCursor: null } }))
  return { fetchImpl, accessToken: 'test-not-real', userId: 'own', now: new Date('2026-10-26T00:00:00Z') }
}
describe('authenticated email landing page', () => {
  it('loads only the linked patient’s appointments using the Veracruz day and the private API', async () => {
    const input = fixture(); const passes = await loadPatientBuildingPasses(input)
    expect(passes).toHaveLength(1); expect(passes[0].pass.state).toBe('missing')
    expect(input.fetchImpl.mock.calls[1][0]).toContain('from=2026-10-25&to=2026-10-26&pageSize=100')
    expect(input.fetchImpl.mock.calls[2][0]).toBe('https://api.bouclier-clinique.com/api/clinical/appointments/501/building-pass')
    expect(input.fetchImpl.mock.calls.every(([, options]) => options.cache === 'no-store')).toBe(true)
  })
  it.each([{ ...profile, authUserId: 'other' }, { ...profile, role: 'doctor' }, { ...profile, linked: false }])('rejects an invalid account before loading appointments', async value => {
    const input = fixture(); input.fetchImpl.mockResolvedValueOnce(response({ profile: value }))
    await expect(loadPatientBuildingPasses(input)).rejects.toThrow('vínculo'); expect(input.fetchImpl).toHaveBeenCalledTimes(1)
  })
  it('rejects a cross-patient appointment before requesting a QR', async () => {
    const input = fixture(); input.fetchImpl.mockResolvedValueOnce(response({ profile })).mockResolvedValueOnce(response({ appointments: [{ ...appointment, patientId: 43 }] }))
    await expect(loadPatientBuildingPasses(input)).rejects.toThrow('pertenencia'); expect(input.fetchImpl).toHaveBeenCalledTimes(2)
  })
  it('does not interpret an API failure as no appointments', async () => {
    const input = fixture(); input.fetchImpl.mockResolvedValueOnce({ ok: false, headers: new Headers({ 'Content-Type': 'text/html' }) })
    await expect(loadPatientBuildingPasses(input)).rejects.toThrow('no está disponible')
  })
  it('follows pagination and rejects repeated cursors', async () => {
    const input = fixture(); input.fetchImpl.mockResolvedValueOnce(response({ profile }))
      .mockResolvedValueOnce(response({ appointments: [appointment], pagination: { nextCursor: 'cursor' } }))
      .mockResolvedValueOnce(response({ appointments: [], pagination: { nextCursor: null } }))
    expect(await loadPatientBuildingPasses(input)).toHaveLength(1)
    expect(input.fetchImpl.mock.calls[2][0]).toContain('cursor=cursor')
    const loop = fixture(); loop.fetchImpl.mockResolvedValueOnce(response({ profile }))
      .mockResolvedValue(response({ appointments: [], pagination: { nextCursor: 'same' } }))
    await expect(loadPatientBuildingPasses(loop)).rejects.toThrow('completar')
  })
  it('distinguishes an empty verified agenda from an error', async () => {
    const input = fixture(); input.fetchImpl.mockResolvedValueOnce(response({ profile })).mockResolvedValueOnce(response({ appointments: [] }))
    expect(await loadPatientBuildingPasses(input)).toEqual([])
  })
  it('never renders external image links or revoked/expired credentials', () => {
    const value = { pass: { state: 'active', availableAt: '2026-10-25T09:00:00-06:00', validFrom: '2026-10-25T17:30:00-06:00', validTo: '2026-10-25T19:30:00-06:00' }, imageDataUrl: 'data:image/png;base64,cHJpdmF0ZQ==' }
    expect(visibleBuildingPass(value, Date.parse(value.pass.availableAt))).toBe(true)
    expect(visibleBuildingPass(value, Date.parse(value.pass.validTo))).toBe(false)
    expect(visibleBuildingPass({ ...value, imageDataUrl: 'https://other.example/qr' }, Date.parse(value.pass.availableAt))).toBe(false)
    expect(visibleBuildingPass({ ...value, pass: { ...value.pass, state: 'revocation_pending' } }, Date.parse(value.pass.availableAt))).toBe(false)
  })
})
