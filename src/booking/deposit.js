export const DEPOSIT_RATE_BPS = 3000

export function calculateDepositMinor(priceMinor, rateBps = DEPOSIT_RATE_BPS) {
  if (!Number.isSafeInteger(priceMinor) || priceMinor < 0) {
    throw new TypeError('priceMinor debe ser un entero no negativo')
  }
  if (!Number.isSafeInteger(rateBps) || rateBps < 0 || rateBps > 10000) {
    throw new TypeError('rateBps debe ser un entero entre 0 y 10000')
  }

  return Math.round((priceMinor * rateBps) / 10000)
}
