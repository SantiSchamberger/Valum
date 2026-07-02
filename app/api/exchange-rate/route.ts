import { NextRequest, NextResponse } from 'next/server'

// FORZAR A NEXT.JS A ANULAR EL CACHÉ DE ESTA API EN PRODUCCIÓN
export const dynamic = 'force-dynamic'

// Función para obtener el dólar oficial real de forma confiable
async function fetchRealOficialRate() {
  try {
    // Usamos la API de argentina-datos que es súper estable para el oficial
    const response = await fetch('https://api.argentinadatos.com/v1/cotizaciones/dolares/oficial', {
      cache: 'no-store'
    })

    if (response.ok) {
      const data = await response.json()
      // Esta API devuelve un objeto o array con { venta: X, compra: Y, fecha: "YYYY-MM-DD" }
      // Tomamos el valor de venta que suele ser el de referencia para las finanzas
      const rate = data.venta || data.rate
      if (rate) return parseFloat(String(rate))
    }
  } catch (error) {
    console.error('Error fetching from Argentina Datos:', error)
  }

  // Fallback 2: Bluelytics (otra API súper usada y gratuita en Argentina)
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
    console.error('Error fetching from Bluelytics:', error)
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    const dateParam = request.nextUrl.searchParams.get('date')

    let today = dateParam

    // CORRECCIÓN DE ZONA HORARIA: Calculamos el día actual real en Argentina (no la del servidor)
    if (!today) {
      const argDateStr = new Date().toLocaleString('en-US', { timeZone: 'America/Buenos_Aires' })
      const argDate = new Date(argDateStr)
      const yyyy = argDate.getFullYear()
      const mm = String(argDate.getMonth() + 1).padStart(2, '0')
      const dd = String(argDate.getDate()).padStart(2, '0')
      today = `${yyyy}-${mm}-${dd}`
    }

    // Intentar obtener la cotización oficial real de las APIs confiables
    const realRate = await fetchRealOficialRate()

    if (realRate) {
      return NextResponse.json({
        date: today,
        rate: realRate,
        source: 'api_oficial_argentina',
        currency: 'ARS',
        base: 'USD'
      })
    }

    // Si fallan todas las APIs, retornamos el valor por defecto que tenías para no romper el flujo
    return NextResponse.json({
      date: today,
      rate: 1000,
      source: 'default',
      currency: 'ARS',
      base: 'USD',
      note: 'Using default rate - APIs unavailable'
    })

  } catch (error) {
    console.error('Error fetching exchange rate:', error)

    return NextResponse.json({
      date: new Date().toISOString().split('T')[0],
      rate: 1000,
      source: 'default',
      currency: 'ARS',
      base: 'USD',
      error: 'Failed to fetch from API'
    }, { status: 200 })
  }
}