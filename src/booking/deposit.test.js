import { describe, expect, it } from 'vitest'
import { calculateDepositMinor } from './deposit.js'

describe('calculateDepositMinor', () => {
  it('calcula el 30% en unidades menores y redondea', () => {
    expect(calculateDepositMinor(10000)).toBe(3000)
    expect(calculateDepositMinor(9999)).toBe(3000)
  })

  it('rechaza importes y tasas inválidos', () => {
    expect(() => calculateDepositMinor(-1)).toThrow()
    expect(() => calculateDepositMinor(100.5)).toThrow()
    expect(() => calculateDepositMinor(10000, 10001)).toThrow()
  })
})
