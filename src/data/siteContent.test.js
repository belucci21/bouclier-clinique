import { describe, expect, it } from 'vitest'
import { SITE_CONTENT } from './siteContent.js'

describe('contenido institucional unificado', () => {
  it('expone un solo contacto y una sede clínica verificable', () => {
    expect(SITE_CONTENT.phone.e164).toBe('+522291087016')
    expect(SITE_CONTENT.email).toBe('bouclier.bdr@gmail.com')
    expect(SITE_CONTENT.location.city).toBe('Boca del Río, Veracruz')
    expect(SITE_CONTENT.location.mapsUrl).toMatch(/^https:\/\/maps\.app\.goo\.gl\//)
  })

  it('usa perfiles sociales específicos y no enlaces vacíos', () => {
    const serialized = JSON.stringify(SITE_CONTENT)

    expect(SITE_CONTENT.social.instagram).toBe('https://www.instagram.com/bouclier_dermatologia_/')
    expect(SITE_CONTENT.social.facebook).toMatch(/Bouclier\.boca/)
    expect(serialized).not.toMatch(/href=["']?#|instagram\.com["']|facebook\.com["']/i)
  })

  it('no mezcla ciudades antiguas ni contenido de tienda', () => {
    expect(JSON.stringify(SITE_CONTENT)).not.toMatch(/CDMX|Playa del Carmen|carrito|stock|mayoreo|producto|farmacia/i)
  })
})
