import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll()
          console.log('[MIDDLEWARE] Available cookies:', cookies.map(c => c.name))
          return cookies
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            console.log('[MIDDLEWARE] Setting cookie:', name)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // This refreshes a user's session
  const { data: { user }, error } = await supabase.auth.getUser()
  console.log('[MIDDLEWARE] User check result:', user?.id || 'no user', error?.message || '')

  return response
}
