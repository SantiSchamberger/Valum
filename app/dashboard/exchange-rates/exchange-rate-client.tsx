'use client'

import { useState, useEffect, useMemo } from 'react' // <-- CORREGIDO: Agregado useMemo aquí
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ExchangeRate {
  id: string
  date: string
  rate: number
  source: string
}

interface ExchangeRateClientProps {
  exchangeRates: ExchangeRate[]
}

export default function ExchangeRateClient({ exchangeRates }: ExchangeRateClientProps) {
  const [rates, setRates] = useState<ExchangeRate[]>(exchangeRates)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentRate, setCurrentRate] = useState<number | null>(null)

  // Obtener la tasa actual al montar el componente
  useEffect(() => {
    fetchCurrentRate()

    // Actualizar cada 5 minutos de forma automática
    const interval = setInterval(fetchCurrentRate, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchCurrentRate = async () => {
    try {
      setIsRefreshing(true)

      // Agregamos el timestamp para romper el caché de Next.js/Vercel
      const response = await fetch(`/api/get-exchange-rate?t=${new Date().getTime()}`)
      const data = await response.json()

      if (data && data.rate) {
        setCurrentRate(data.rate)

        // ACTUALIZACIÓN REACTIVA: Si el día de hoy no está en el histórico, o cambió de valor, lo actualizamos en la gráfica
        setRates(prevRates => {
          const exists = prevRates.some(r => r.date === data.date)
          if (exists) {
            return prevRates.map(r => r.date === data.date ? { ...r, rate: data.rate } : r)
          } else {
            return [...prevRates, {
              id: data.id || Math.random().toString(),
              date: data.date,
              rate: data.rate,
              source: data.source
            }]
          }
        })
      }
    } catch (error) {
      console.error('Error fetching current rate:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Ordenamos cronológicamente por texto YYYY-MM-DD puro de forma segura
  const sortedRates = useMemo(() => {
    return [...rates].sort((a, b) => a.date.localeCompare(b.date))
  }, [rates])

  const chartData = useMemo(() => {
    return sortedRates.map(r => {
      const [year, month, day] = r.date.split('-')
      return {
        date: `${day}/${month}`, // Formato limpio "DD/MM" para el eje X
        rate: r.rate,
        fullDate: r.date,
      }
    })
  }, [sortedRates])

  const minRate = sortedRates.length > 0 ? Math.min(...sortedRates.map(r => r.rate)) : null
  const maxRate = sortedRates.length > 0 ? Math.max(...sortedRates.map(r => r.rate)) : null

  // Cálculo corregido de la fecha de hoy en Argentina
  const argDateStr = new Date().toLocaleString('en-US', { timeZone: 'America/Buenos_Aires' })
  const argDate = new Date(argDateStr)
  const today = `${argDate.getFullYear()}-${String(argDate.getMonth() + 1).padStart(2, '0')}-${String(argDate.getDate()).padStart(2, '0')}`

  const latestRate = sortedRates.length > 0 ? sortedRates[sortedRates.length - 1] : null

  const previousRate: number | null = (() => {
    if (!latestRate) return null
    if (sortedRates.length === 1) {
      return latestRate.date === today ? null : latestRate.rate
    }
    return latestRate.date === today
      ? sortedRates[sortedRates.length - 2].rate
      : latestRate.rate
  })()

  const change: number | null = currentRate !== null && previousRate !== null ? currentRate - previousRate : null

  const changePercent: string | null = change !== null && previousRate !== null
    ? ((change / previousRate) * 100).toFixed(2)
    : null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center gap-3 py-4 sm:h-16 sm:py-0">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="font-medium">
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Volver
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violeta-principal to-violeta-claro flex items-center justify-center shadow-sm">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">Tipo de Cambio USD/ARS</h1>
              </div>
            </div>
            <button
              onClick={fetchCurrentRate}
              disabled={isRefreshing}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Actualizar"
            >
              <RefreshCw
                className={`w-5 h-5 text-violeta-principal ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Rate Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Current Rate */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-1 bg-violeta-principal" />
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-medium mb-2">Tasa Actual</p>
              {currentRate !== null ? (
                <p className="text-3xl font-bold text-violeta-principal tracking-tight">
                  ${currentRate.toFixed(2)}
                </p>
              ) : (
                <p className="text-3xl font-bold text-muted-foreground tracking-tight">Cargando...</p>
              )}
              <p className="text-xs text-muted-foreground font-light mt-2">Por 1 USD</p>
            </CardContent>
          </Card>

          {/* Min Rate */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-1 bg-emerald-500" />
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-medium mb-2">Mínimo</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {minRate !== null ? `$${minRate.toFixed(2)}` : 'Sin datos'}
              </p>
              <p className="text-xs text-muted-foreground font-light mt-2">Últimos 30 días</p>
            </CardContent>
          </Card>

          {/* Max Rate */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-1 bg-rose-500" />
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-medium mb-2">Máximo</p>
              <p className="text-3xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">
                {maxRate !== null ? `$${maxRate.toFixed(2)}` : 'Sin datos'}
              </p>
              <p className="text-xs text-muted-foreground font-light mt-2">Últimos 30 días</p>
            </CardContent>
          </Card>

          {/* Change */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className={`h-1 ${change === null ? 'bg-border' : change >= 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-medium mb-2">Diferencia vs anterior</p>
              {change !== null ? (
                <>
                  <div className="flex items-center gap-2">
                    <p className={`text-3xl font-bold tracking-tight ${change >= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {change >= 0 ? '+' : ''}{change.toFixed(2)}
                    </p>
                    {change !== 0 ? (
                      change >= 0 ? (
                        <TrendingUp className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      )
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground font-light mt-2">
                    {changePercent ? `${changePercent}% respecto al anterior` : 'No hay datos anteriores'}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground font-light">No hay dato anterior para comparar</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        {rates.length > 0 && (
          <Card className="border-0 shadow-md">
            <div className="h-1 bg-violeta-principal rounded-t-lg" />
            <CardHeader className="pt-5">
              <CardTitle className="text-lg font-bold tracking-tight">Evolución del Tipo de Cambio</CardTitle>
              <CardDescription className="font-light">Últimos 30 días - USD a ARS</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={360}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-5" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'currentColor' }} tickLine={false} axisLine={false} dy={8} />
                  <YAxis tick={{ fontSize: 11, fill: 'currentColor' }} tickLine={false} axisLine={false} dx={-8} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', background: 'var(--card)', borderColor: 'var(--border)' }}
                    formatter={(value) => `$${Number(value).toFixed(2)}`}
                    labelFormatter={(label) => `Fecha: ${label}`}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '13px' }} />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#6C3BFF"
                    name="Tipo de Cambio (ARS)"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 0, fill: '#6C3BFF' }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#6C3BFF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Histórico de cambios */}
        {sortedRates.length > 1 && (
          <Card className="border-0 shadow-md mt-8">
            <div className="h-1 bg-violeta-claro rounded-t-lg" />
            <CardHeader className="pt-5">
              <CardTitle className="text-lg font-bold tracking-tight">Histórico de Cambios</CardTitle>
              <CardDescription className="font-light">Comparación diaria del tipo de cambio USD/ARS</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border/50 max-h-[400px] overflow-y-auto pr-2">
              {[...sortedRates].reverse().map((rate, index, array) => {
                if (index === array.length - 1) {
                  return (
                    <div key={rate.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{rate.date.split('-').reverse().join('/')}</p>
                        <p className="text-xs text-muted-foreground font-light">Precio Base: ${rate.rate.toFixed(2)}</p>
                      </div>
                      <span className="text-xs text-muted-foreground font-light italic">Punto de partida del registro</span>
                    </div>
                  )
                }

                const previousInTime = array[index + 1]
                const delta = rate.rate - previousInTime.rate
                const deltaPercent = previousInTime.rate > 0 ? ((delta / previousInTime.rate) * 100).toFixed(2) : '0.00'
                const isUp = delta > 0

                return (
                  <div key={rate.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {rate.date.split('-').reverse().join('/')}
                      </p>
                      <p className="text-xs text-muted-foreground font-light">Precio: ${rate.rate.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                      {isUp ? (
                        <TrendingUp className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      )}
                      <span className={isUp ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                        {delta >= 0 ? '+' : ''}${Math.abs(delta).toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground font-light">({deltaPercent}%){isUp ? ' ↑' : ' ↓'}</span>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="border-0 shadow-md mt-8">
          <CardHeader>
            <CardTitle className="text-base font-bold tracking-tight">Información de Sistema</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2 font-light">
            <p>• El tipo de cambio se sincroniza automáticamente cada 5 minutos.</p>
            <p>• Los datos se extraen de pizarras financieras nacionales minuto a minuto.</p>
            <p>• Se almacenan históricos para análisis comparativos y auditorías de patrimonio.</p>
            <p>• Se usa la tasa del día al registrar transacciones en USD de forma nativa.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}