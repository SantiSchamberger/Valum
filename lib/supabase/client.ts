import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === 'undefined') {
            return []
          }
          const cookies = document.cookie.split('; ').map(cookie => {
            const [name, ...rest] = cookie.split('=')
            return {
              name,
              value: decodeURIComponent(rest.join('=')),
            }
          })
          return cookies
        },
        setAll(cookiesToSet) {
          if (typeof document === 'undefined') {
            return
          }
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieString = `${name}=${encodeURIComponent(value)}${
              options?.maxAge ? `; Max-Age=${options.maxAge}` : ''
            }${options?.path ? `; Path=${options.path}` : ''}${
              options?.domain ? `; Domain=${options.domain}` : ''
            }${options?.secure ? '; Secure' : ''}${
              options?.sameSite ? `; SameSite=${options.sameSite}` : ''
            }`
            document.cookie = cookieString
          })
        },
      },
    }
  )
}
