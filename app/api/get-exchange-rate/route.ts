import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

async function fetchExternalRate() {
  // 1. Intentar con Argentina Datos (Pizarra local)
  try {
    const response = await fetch('https://api.argentinadatos.com/v1/cotizaciones/dolares/oficial', {
      cache: 'no-store'
    })
    if (response.ok) {
      const data = await response.json()
      const rate = data.venta || data.rate
      if (rate) return parseFloat(String(rate))
    }
  } catch (error) {
    console.error('Error fetching from Argentina Datos:', error)
  }

  // 2. Fallback: Bluelytics
  try {
    const response = await fetch('https://api.bluelytics.com.ar/v2/latest', {
      cache: 'no-store'
    })
    if (response.ok) {
      const data = await response.json()
      const rate = data.oficial?.value_sell
      if (rate) return parseFloat(String(rate))
    }
  } catch (error) {
    console.error('Error fetching from Bluelytics API:', error)
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const dateParam = request.nextUrl.searchParams.get('date')

    let today = dateParam

    if (!today) {
      const argDateStr = new Date().toLocaleString('en-US', { timeZone: 'America/Buenos_Aires' })
      const argDate = new Date(argDateStr)
      const yyyy = argDate.getFullYear()
      const mm = String(argDate.getMonth() + 1).padStart(2, '0')
      const dd = String(argDate.getDate()).padStart(2, '0')
      today = `${yyyy}-${mm}-${dd}`
    }

    // 1. Primero buscamos si YA existe una tasa guardada en la BD para HOY
    const { data: existingRate, error: searchError } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('date', today)
      .eq('currency_from', 'USD')
      .eq('currency_to', 'ARS')
      .maybeSingle() // <-- CORRECCIÓN: No rompe si la tabla está vacía

    if (searchError) {
      console.error('Error buscando tasa en BD:', searchError)
    }

    // Si ya existe en la base de datos, la devolvemos directo para ahorrar recursos
    if (existingRate) {
      return NextResponse.json({
        id: existingRate.id,
        date: existingRate.date,
        currency_from: existingRate.currency_from,
        currency_to: existingRate.currency_to,
        rate: existingRate.rate,
        source: existingRate.source
      })
    }

    // 2. Si no existía, vamos a buscarla a internet
    const externalRate = await fetchExternalRate()

    if (externalRate) {
      // Intentamos guardarla de forma segura en la base de datos
      const { data: insertedData, error: insertError } = await supabase
        .from('exchange_rates')
        .insert({
          date: today,
          currency_from: 'USD',
          currency_to: 'ARS',
          rate: externalRate,
          source: 'external_api'
        })
        .select()
        .maybeSingle()

      if (insertError) {
        // Si da error de RLS, el log te lo va a cantar acá en la consola de Vercel
        console.error('ERROR CRÍTICO AL INSERTAR EN SUPABASE:', insertError)
      }

      return NextResponse.json({
        id: insertedData?.id || Math.random().toString(),
        date: today,
        currency_from: 'USD',
        currency_to: 'ARS',
        rate: externalRate,
        source: 'external_api'
      })
    }

    // 3. Fallback de emergencia total
    return NextResponse.json({
      date: today,
      currency_from: 'USD',
      currency_to: 'ARS',
      rate: 1000,
      source: 'default',
      note: 'No exchange rate data available'
    })

  } catch (error) {
    console.error('Error general en GET get-exchange-rate:', error)
    return NextResponse.json({ error: 'Internal server error', rate: 1000, source: 'default' }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { date, rate } = await request.json()

    if (!date || !rate) {
      return NextResponse.json({ error: 'Missing date or rate' }, { status: 400 })
    }

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