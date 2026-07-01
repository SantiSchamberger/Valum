'use client'

import { useState, useEffect } from 'react'
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

  // Obtener la tasa actual
  useEffect(() => {
    fetchCurrentRate()
    
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchCurrentRate, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchCurrentRate = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch('/api/get-exchange-rate')
      const data = await response.json()
      setCurrentRate(data.rate)
    } catch (error) {
      console.error('Error fetching current rate:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const chartData = rates.map(r => ({
    date: new Date(r.date).toLocaleDateString('es-AR', { month: 'short', day: 'numeric' }),
    rate: r.rate,
    fullDate: r.date
  }))

  const minRate = Math.min(...rates.map(r => r.rate))
  const maxRate = Math.max(...rates.map(r => r.rate))
  const avgRate = rates.reduce((sum, r) => sum + r.rate, 0) / rates.length
  const change = currentRate && rates.length > 0 ? currentRate - rates[0].rate : 0
  const changePercent = rates.length > 0 ? ((change / rates[0].rate) * 100).toFixed(2) : '0.00'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center gap-3 py-4 sm:h-16 sm:py-0">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Volver
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-sm">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Tipo de Cambio USD/ARS</h1>
              </div>
            </div>
            <button
              onClick={fetchCurrentRate}
              disabled={isRefreshing}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Actualizar"
            >
              <RefreshCw
                className={`w-5 h-5 text-blue-600 dark:text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`}
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
            <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-medium mb-2">Tasa Actual</p>
              {currentRate && (
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ${currentRate.toFixed(2)}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">Por 1 USD</p>
            </CardContent>
          </Card>

          {/* Min Rate */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-green-500" />
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-medium mb-2">Mínimo</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                ${minRate.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">Últimos 30 días</p>
            </CardContent>
          </Card>

          {/* Max Rate */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-rose-400 to-red-500" />
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-medium mb-2">Máximo</p>
              <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                ${maxRate.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">Últimos 30 días</p>
            </CardContent>
          </Card>

          {/* Change */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className={`h-1 ${change >= 0 ? 'bg-gradient-to-r from-rose-400 to-red-500' : 'bg-gradient-to-r from-emerald-400 to-green-500'}`} />
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-medium mb-2">Cambio</p>
              <div className="flex items-center gap-2">
                <p className={`text-3xl font-bold ${change >= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {change >= 0 ? '+' : ''}{change.toFixed(2)}
                </p>
                {change !== 0 && (
                  change >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  )
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{changePercent}% en 30d</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        {rates.length > 0 && (
          <Card className="border-0 shadow-md">
            <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t-lg" />
            <CardHeader className="pt-5">
              <CardTitle className="text-lg font-bold">Evolución del Tipo de Cambio</CardTitle>
              <CardDescription>Últimos 30 días - USD a ARS</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={360}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => `$${Number(value).toFixed(2)}`}
                    labelFormatter={(label) => `Fecha: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#3b82f6"
                    name="Tipo de Cambio (ARS)"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Histórico de cambios */}
        {rates.length > 1 && (
          <Card className="border-0 shadow-md mt-8">
            <div className="h-1 bg-gradient-to-r from-cyan-400 to-sky-500 rounded-t-lg" />
            <CardHeader className="pt-5">
              <CardTitle className="text-lg font-bold">Histórico de cambios</CardTitle>
              <CardDescription>Comparación diaria del tipo de cambio USD/ARS</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border/50">
              {rates.map((rate, index) => {
                if (index === 0) return null

                const previousRate = rates[index - 1]
                const delta = rate.rate - previousRate.rate
                const deltaPercent = previousRate.rate > 0 ? ((delta / previousRate.rate) * 100).toFixed(2) : '0.00'
                const isUp = delta > 0

                return (
                  <div key={rate.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{new Date(rate.date).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                      <p className="text-xs text-muted-foreground">Precio: ${rate.rate.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                      {isUp ? (
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-rose-600" />
                      )}
                      <span className={isUp ? 'text-emerald-600' : 'text-rose-600'}>
                        {delta >= 0 ? '+' : ''}${Math.abs(delta).toFixed(2)}
                      </span>
                      <span className="text-muted-foreground">({deltaPercent}%){isUp ? ' ↑' : ' ↓'}</span>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="border-0 shadow-md mt-8 bg-blue-50 dark:bg-blue-950/30">
          <CardHeader>
            <CardTitle className="text-base font-bold">Información</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• El tipo de cambio se actualiza automáticamente cada 5 minutos</p>
            <p>• Los datos se obtienen de APIs públicas de tipo de cambio</p>
            <p>• Se almacenan históricos para análisis comparativos</p>
            <p>• Se usa la tasa del día al registrar transacciones en USD</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
