export function authConfirmationError(search = '', hash = '') {
  const query = new URLSearchParams(search)
  const fragment = new URLSearchParams(hash.replace(/^#/, ''))
  return Boolean(query.get('error') || query.get('error_code') || fragment.get('error') || fragment.get('error_code'))
}

export function confirmationStatus({ data, error }, hasLinkError = false) {
  if (hasLinkError || error) return 'error'
  return data?.session?.user?.email_confirmed_at ? 'confirmed' : 'missing'
}

export function stripAuthReturnSecrets(location, history) {
  const url = new URL(location.href)
  for (const key of ['access_token', 'refresh_token', 'token', 'token_hash', 'code', 'error', 'error_code', 'error_description', 'type', 'expires_in', 'expires_at', 'token_type']) url.searchParams.delete(key)
  // The callback has no public fragment state; never retain session credentials
  // in browser history or pass them to analytics, mail links or app-store URLs.
  url.hash = ''
  history.replaceState(null, '', url.pathname + url.search)
}
