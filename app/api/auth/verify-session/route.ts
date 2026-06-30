import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json(
        { authenticated: false, error: error?.message || 'No user' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { authenticated: true, user: { id: user.id, email: user.email } },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API] Session verification error:', error)
    return NextResponse.json(
      { authenticated: false, error: 'Server error' },
      { status: 500 }
    )
  }
}
