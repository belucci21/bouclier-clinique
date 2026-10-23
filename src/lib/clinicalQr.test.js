import { describe, expect, it, vi } from 'vitest'
import { loadClinicalQrIdentity } from './clinicalQr'
const profile = { authUserId: 'own', role: 'patient', linked: true, clinicalId: '42', fullName: 'Prueba' }
function response(value = profile) { return { ok: true, headers: new Headers({ 'Content-Type': 'application/json' }), json: async () => ({ profile: value }) } }
describe('private clinical QR, without third-party rendering', () => {
  it('uses only the canonical patient ID verified by the authenticated clinical API', async () => {
    const fetchImpl = vi.fn(async () => response())
    const result = await loadClinicalQrIdentity({ userId: 'own', accessToken: 'private', fetchImpl })
    expect(JSON.parse(result.payload)).toMatchObject({ patientId: '42', qrCode: 'MYSQL-PAT-42', appointmentId: null })
    expect(fetchImpl.mock.calls[0][0]).toBe('https://api.bouclier-clinique.com/api/clinical/me')
  })
  it.each([{ ...profile, authUserId: 'another' }, { ...profile, role: 'doctor' }, { ...profile, linked: false }, { ...profile, clinicalId: null }])('does not create a fallback QR for an unverified identity', async value => {
    await expect(loadClinicalQrIdentity({ userId: 'own', accessToken: 'private', fetchImpl: async () => response(value) })).rejects.toThrow()
  })
  it('rejects HTML rather than interpreting it as JSON', async () => {
    await expect(loadClinicalQrIdentity({ userId: 'own', accessToken: 'private', fetchImpl: async () => ({ headers: new Headers({ 'Content-Type': 'text/html' }) }) })).rejects.toThrow()
  })
})
