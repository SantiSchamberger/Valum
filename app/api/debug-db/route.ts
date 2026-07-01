import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Fetch one transaction to inspect its keys
    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .limit(1)

    // Fetch one profile to inspect its keys
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    // Fetch one advisor_clients relation
    const { data: relationData, error: relationError } = await supabase
      .from('advisor_clients')
      .select('*')
      .limit(1)

    return NextResponse.json({
      transactions: {
        data: txData,
        error: txError,
        keys: txData && txData.length > 0 ? Object.keys(txData[0]) : null
      },
      profiles: {
        data: profileData,
        error: profileError,
        keys: profileData && profileData.length > 0 ? Object.keys(profileData[0]) : null
      },
      advisor_clients: {
        data: relationData,
        error: relationError,
        keys: relationData && relationData.length > 0 ? Object.keys(relationData[0]) : null
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
