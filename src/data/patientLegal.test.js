import { describe, expect, it } from 'vitest'
import legal from './patientLegal.json'
describe('patient legal pages', () => {
  it('includes the responsible party, actual contact, retention, rights and AI disclosure', () => {
    expect(legal.version).toBe('2026-11-02')
    expect(legal.supportEmail).toBe('marketing@bouclier-clinique.com')
    expect(legal.privacy.map(x => x.body).join(' ')).toMatch(/conservación legal/)
    expect(legal.privacy.map(x => x.body).join(' ')).toMatch(/derechos ARCO/)
    expect(legal.terms.map(x => x.body).join(' ')).toMatch(/desarrollado con ayuda de herramientas de inteligencia artificial/)
    expect(legal.terms.map(x => x.body).join(' ')).not.toMatch(/No facturación|se consideran realizadas/)
  })
})
