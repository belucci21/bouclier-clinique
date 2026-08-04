import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('Bouclier Dermatología brand', () => {
  it('uses the approved name in the base document before lazy routes load', () => {
    const indexHtml = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')

    expect(indexHtml).toContain('<title>Bouclier Dermatología | Medicina estética con criterio</title>')
    expect(indexHtml).not.toContain('Bouclier Clinique')
  })

  it('contains no legacy Bouclier Clinique name in web source or public HTML', () => {
    function readTree(relativeDirectory) {
      const directory = new URL(relativeDirectory, import.meta.url)
      return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const child = new URL(entry.name, directory.href.endsWith('/') ? directory : `${directory.href}/`)
        if (entry.isDirectory()) return readTree(child.href)
        if (entry.name.includes('.test.')) return []
        if (!/\.(?:js|jsx|css|html)$/.test(entry.name)) return []
        return readFileSync(child, 'utf8')
      })
    }

    const renderedSource = [...readTree('../../src/'), ...readTree('../../public/')].join('\n')
    expect(renderedSource).not.toMatch(/Bouclier Clinique/i)
  })
})
