// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  if (typeof document === 'undefined') return null

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return document.cookie
            .split('; ')
            .map(c => {
              const [name, ...rest] = c.split('=')
              return { name, value: rest.join('=') }
            })
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            let cookie = `${name}=${value}; path=/`
            if (options?.maxAge) cookie += `; max-age=${options.maxAge}`
            cookie += '; SameSite=Lax'
            document.cookie = cookie
          })
        },
      },
    }
  )
}