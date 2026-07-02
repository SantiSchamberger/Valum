import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// FORZAR A NEXT.JS A ANULAR EL CACHÉ DE ESTA API EN PRODUCCIÓN
export const dynamic = 'force-dynamic'

// Reemplaza únicamente la función fetchExternalRate de tu route.ts por esta versión en tiempo real:
async function fetchExternalRate() {
  // PRIORIDAD 1: Argentina Datos (Minuto a minuto oficial real de pizarras locales)
  try {
    const response = await fetch('https://api.argentinadatos.com/v1/cotizaciones/dolares/oficial', {
      cache: 'no-store'
    })

    if (response.ok) {
      const data = await response.json()
      // Esta API nos devuelve el valor de venta instantáneo del mercado oficial
      const rate = data.venta || data.rate
      if (rate) return parseFloat(String(rate))
    }
  } catch (error) {
    console.error('Error fetching from Argentina Datos:', error)
  }

  // PRIORIDAD 2: Bluelytics (Excelente fallback en tiempo real para Argentina)
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

  // PRIORIDAD 3: API global (Tu fallback original que actualiza 1 vez al día)
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      cache: 'no-store'
    })

    if (response.ok) {
      const data = await response.json()
      const rate = data.rates?.ARS
      if (rate) return parseFloat(rate)
    }
  } catch (error) {
    console.error('Error fetching from international fallback:', error)
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const dateParam = request.nextUrl.searchParams.get('date')

    let today = dateParam

    // CORRECCIÓN DE ZONA HORARIA: Si no envían date, calculamos el día actual real en Argentina (no la UTC del servidor)
    if (!today) {
      const argDateStr = new Date().toLocaleString('en-US', { timeZone: 'America/Buenos_Aires' })
      const argDate = new Date(argDateStr)
      const yyyy = argDate.getFullYear()
      const mm = String(argDate.getMonth() + 1).padStart(2, '0')
      const dd = String(argDate.getDate()).padStart(2, '0')
      today = `${yyyy}-${mm}-${dd}`
    }

    // Primero intentar obtener una tasa externa actualizada
    const externalRate = await fetchExternalRate()

    if (externalRate) {
      // Si obtuvimos una tasa externa, guardarla en la BD para este día si no existe
      const { data: existingRate } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('date', today)
        .eq('currency_from', 'USD')
        .eq('currency_to', 'ARS')
        .maybeSingle() // Usamos maybeSingle para evitar excepciones molestas si no encuentra fila

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
      .maybeSingle()

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