import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Función para obtener el tipo de cambio de una API pública
async function fetchExternalRate() {
  try {
    // Intentar con Open Exchange Rates API (requiere clave - fallaría sin ella)
    // Alternativa: usar una API pública gratuita
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      cache: 'no-store'
    })

    if (response.ok) {
      const data = await response.json()
      const rate = data.rates?.ARS
      if (rate) return parseFloat(rate)
    }
  } catch (error) {
    console.error('Error fetching from external API:', error)
  }

  // Fallback: intentar otra API
  try {
    const response = await fetch('https://api.exchange-rates.org/latest?base=USD&symbols=ARS', {
      cache: 'no-store'
    })

    if (response.ok) {
      const data = await response.json()
      const rate = data.rates?.ARS
      if (rate) return parseFloat(rate)
    }
  } catch (error) {
    console.error('Error fetching from fallback API:', error)
  }

  // Si falla, retornar null para usar la BD
  return null
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const date = request.nextUrl.searchParams.get('date')
    
    const today = date || new Date().toISOString().split('T')[0]

    // Primero intentar obtener una tasa externa actualizada
    const externalRate = await fetchExternalRate()
    
    if (externalRate) {
      // Si obtuvimos una tasa externa, guardarla en la BD para este día
      const { data: existingRate } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('date', today)
        .eq('currency_from', 'USD')
        .eq('currency_to', 'ARS')
        .single()

      if (!existingRate) {
        // Guardar la nueva tasa
        await supabase
          .from('exchange_rates')
          .insert({
            date: today,
            currency_from: 'USD',
            currency_to: 'ARS',
            rate: externalRate,
            source: 'external_api'
          })
      }

      return NextResponse.json({
        date: today,
        currency_from: 'USD',
        currency_to: 'ARS',
        rate: externalRate,
        source: 'external_api'
      })
    }

    // Si no hay tasa externa, buscar en BD
    const { data: existingRate } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('date', today)
      .eq('currency_from', 'USD')
      .eq('currency_to', 'ARS')
      .single()

    if (existingRate) {
      return NextResponse.json(existingRate)
    }

    // Si no existe y no pudimos obtener tasa externa, retornar valor por defecto
    return NextResponse.json({
      date: today,
      currency_from: 'USD',
      currency_to: 'ARS',
      rate: 1000,
      source: 'default',
      note: 'No exchange rate data available - using default'
    })
  } catch (error) {
    console.error('Error in get-exchange-rate:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      rate: 1000,
      source: 'default'
    }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { date, rate } = await request.json()

    if (!date || !rate) {
      return NextResponse.json({ error: 'Missing date or rate' }, { status: 400 })
    }

    // Guardar el tipo de cambio
    const { data, error } = await supabase
      .from('exchange_rates')
      .insert({
        date,
        currency_from: 'USD',
        currency_to: 'ARS',
        rate: parseFloat(String(rate)),
        source: 'manual'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in post exchange-rate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
