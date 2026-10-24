import { describe, expect, it } from 'vitest'
import { patientReturnPath } from './patientReturnPath.js'
describe('email login return allowlist', () => {
  it('returns to the private pass without putting an access token or appointment ID in the URL', () => { expect(patientReturnPath('/paciente/acceso')).toBe('/paciente/acceso') })
  it.each([undefined, 'https://attacker.example', '//attacker.example', '/paciente/acceso?token=secret', '/admin', '/paciente/acceso/../../../admin'])('rejects arbitrary destinations %#', value => { expect(patientReturnPath(value)).toBe('/paciente/dashboard') })
})
