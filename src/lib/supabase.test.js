import { describe, expect, it } from 'vitest'
import { SUPABASE_PROJECT_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase.js'

describe('Supabase browser configuration', () => {
  it('targets the approved project with a browser-safe publishable key', () => {
    expect(SUPABASE_PROJECT_URL).toBe('https://tmcxgiqmmjpgxqrivbod.supabase.co')
    expect(SUPABASE_PUBLISHABLE_KEY).toMatch(/^sb_publishable_/)
    expect(SUPABASE_PUBLISHABLE_KEY).not.toMatch(/service_role|sk_live|whsec_/)
  })
})