import { describe, expect, it, vi } from 'vitest'
import { authConfirmationError, confirmationStatus, stripAuthReturnSecrets } from './authConfirmation.js'
describe('secure email confirmation return', () => {
  it('detects failed and expired links in query and fragment', () => {
    expect(authConfirmationError('?error_code=otp_expired', '')).toBe(true)
    expect(authConfirmationError('', '#error=access_denied')).toBe(true)
    expect(authConfirmationError('', '#access_token=secret')).toBe(false)
  })
  it('requires an actually confirmed session, not just a URL claiming success', () => {
    expect(confirmationStatus({ data: { session: { user: { email_confirmed_at: '2026-11-02' } } } })).toBe('confirmed')
    expect(confirmationStatus({ data: { session: null } })).toBe('missing')
    expect(confirmationStatus({ data: { session: { user: {} } } })).toBe('missing')
    expect(confirmationStatus({ data: { session: { user: { email_confirmed_at: 'yes' } } } }, true)).toBe('error')
    expect(confirmationStatus({ error: new Error('failure') })).toBe('error')
  })
  it('removes secrets and does not follow external redirects', () => {
    const history = { replaceState: vi.fn() }
    stripAuthReturnSecrets({ href: 'https://bouclier-clinique.com/auth/confirmacion?code=secret&token_hash=secret#access_token=secret&refresh_token=secret' }, history)
    expect(history.replaceState).toHaveBeenCalledWith(null, '', '/auth/confirmacion')
  })
})
