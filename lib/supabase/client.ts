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
          
          const cookies: { name: string; value: string }[] = []
          document.cookie.split('; ').forEach(cookie => {
            if (cookie) {
              const [name, ...rest] = cookie.split('=')
              cookies.push({
                name,
                value: decodeURIComponent(rest.join('=')),
              })
            }
          })
          return cookies
        },
        setAll(cookiesToSet) {
          if (typeof document === 'undefined') {
            return
          }
          
          cookiesToSet.forEach(({ name, value, options }) => {
            let cookieString = `${name}=${encodeURIComponent(value)}`
            
            if (options?.maxAge) {
              cookieString += `; Max-Age=${options.maxAge}`
            }
            if (options?.path) {
              cookieString += `; Path=${options.path}`
            }
            if (options?.domain) {
              cookieString += `; Domain=${options.domain}`
            }
            if (options?.secure) {
              cookieString += '; Secure'
            }
            if (options?.sameSite) {
              cookieString += `; SameSite=${options.sameSite}`
            }
            
            document.cookie = cookieString
          })
        },
      },
    }
  )
}
