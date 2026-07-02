'use client'

import { useMemo, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  date: string
  category_id: string | null
  currency: string
  categories: any
}

interface Category {
  id: string
  name: string
  color: string
}

interface AnalyticsClientProps {
  user: any
  transactions: Transaction[]
  categories: Category[]
}

const getArgentinaDate = (dateString: string): Date => {
  if (!dateString) return new Date()
  const pureDateSegment = dateString.split('T')[0]
  const [yearStr, monthStr, dayStr] = pureDateSegment.split('-')
  return new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr), 12, 0, 0)
}

export default function AnalyticsClient({
  user,
  transactions,
  categories,
}: AnalyticsClientProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<'ARS' | 'USD'>('ARS')
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('')

  // Estado de privacidad heredado del Dashboard
  const [hideBalances, setHideBalances] = useState(false)

  // Cargar preferencia de privacidad sincronizada
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPrivacy = localStorage.getItem('valumHideBalances') === 'true'
      setHideBalances(storedPrivacy)
    }
  }, [])

  const handleSelectedYearChange = (value: string | null) => {
    setSelectedYear(value ?? '')
  }

  const handleSelectedMonthChange = (value: string | null) => {
    setSelectedMonth(value ?? '')
  }

  const nowInArg = getArgentinaDate(new Date().toISOString().split('T')[0])
  const defaultMonth = String(nowInArg.getMonth() + 1).padStart(2, '0')
  const defaultYear = String(nowInArg.getFullYear())

  const currentMonth = selectedMonth || defaultMonth
  const currentYear = selectedYear || defaultYear

  const hasUSD = useMemo(() => transactions.some(t => t.currency === 'USD'), [transactions])

  const filteredTransactions = useMemo(
    () => transactions.filter(t => !t.currency || t.currency === selectedCurrency),
    [transactions, selectedCurrency]
  )

  const years = useMemo(() => {
    const yearSet = new Set(transactions.map(t => {
      const argDate = getArgentinaDate(t.date)
      return argDate.getFullYear().toString()
    }))
    return Array.from(yearSet).sort((a, b) => Number(b) - Number(a))
  }, [transactions])

  const months = useMemo(() => {
    const monthSet = new Set(
      filteredTransactions
        .filter(t => {
          const argDate = getArgentinaDate(t.date)
          return argDate.getFullYear().toString() === currentYear
        })
        .map(t => {
          const argDate = getArgentinaDate(t.date)
          return String(argDate.getMonth() + 1).padStart(2, '0')
        })
    )
    return Array.from(monthSet).sort((a, b) => Number(b) - Number(a))
  }, [filteredTransactions, currentYear])

  const monthlyAnalytics = useMemo(() => {
    const monthTransactions = filteredTransactions.filter(t => {
      const argDate = getArgentinaDate(t.date)
      const monthStr = String(argDate.getMonth() + 1).padStart(2, '0')
      const yearStr = argDate.getFullYear().toString()
      return monthStr === currentMonth && yearStr === currentYear
    })

    const totalIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpense

    const expensesByCategory = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc: any, t) => {
        const categoryName = t.categories?.name || 'Sin categoría'
        const existing = acc.find((item: any) => item.name === categoryName)
        if (existing) {
          existing.value += t.amount
        } else {
          acc.push({
            name: categoryName,
            value: t.amount,
            color: t.categories?.color || '#6C3BFF',
          })
        }
        return acc
      }, [])
      .sort((a: any, b: any) => b.value - a.value)

    const yearNum = parseInt(currentYear)
    const monthNum = parseInt(currentMonth)
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate()

    const pureDailyData: { [key: number]: { income: number; expense: number } } = {}
    for (let d = 1; d <= daysInMonth; d++) {
      pureDailyData[d] = { income: 0, expense: 0 }
    }

    monthTransactions.forEach(t => {
      const argDate = getArgentinaDate(t.date)
      const day = argDate.getDate()
      if (pureDailyData[day]) {
        if (t.type === 'income') pureDailyData[day].income += t.amount
        else pureDailyData[day].expense += t.amount
      }
    })

    const dailyTrend = []
    let accumulatedIncome = 0
    let accumulatedExpense = 0

    for (let d = 1; d <= daysInMonth; d++) {
      accumulatedIncome += pureDailyData[d].income
      accumulatedExpense += pureDailyData[d].expense
      const currentRunningBalance = accumulatedIncome - accumulatedExpense

      const dayStr = String(d).padStart(2, '0')
      dailyTrend.push({
        date: `${dayStr}/${currentMonth}`,
        income: accumulatedIncome,
        expense: accumulatedExpense,
        balance: currentRunningBalance,
        rawDay: d
      })
    }

    return { totalIncome, totalExpense, balance, expensesByCategory, dailyTrend, monthTransactions }
  }, [filteredTransactions, currentMonth, currentYear])

  const analytics = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpense

    const transactionsByMonth = filteredTransactions.reduce((acc: any, t) => {
      const argDate = getArgentinaDate(t.date)
      const monthKey = argDate.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' })

      const existing = acc.find((item: any) => item.month === monthKey)

      if (existing) {
        if (t.type === 'income') existing.income += t.amount
        else existing.expense += t.amount
      } else {
        acc.push({
          month: monthKey,
          income: t.type === 'income' ? t.amount : 0,
          expense: t.type === 'expense' ? t.amount : 0,
          rawYear: argDate.getFullYear(),
          rawMonth: argDate.getMonth() + 1
        })
      }
      return acc
    }, [])
      .sort((a: any, b: any) => {
        if (a.rawYear !== b.rawYear) return a.rawYear - b.rawYear
        return a.rawMonth - b.rawMonth
      })
      .slice(-12)

    return { totalIncome, totalExpense, balance, transactionsByMonth }
  }, [filteredTransactions])

  const getMonthName = (monthNum: string) => {
    const date = new Date(2026, parseInt(monthNum) - 1, 15)
    return date.toLocaleString('es-AR', { month: 'long' })
  }

  const currSymbol = selectedCurrency === 'USD' ? 'US$' : '$'

  const fmt = (v: number) => {
    const formattedNumber = new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v)

    return `${currSymbol}${formattedNumber}`
  }

  // Formateador local exclusivo para las tarjetas superiores de análisis que soporta la censura
  const fmtHeaderCard = (v: number) => {
    if (hideBalances) {
      return `${currSymbol} ••••••`
    }
    return fmt(v)
  }

  return (
    <div className="min-h-screen bg-background">
      <svg className="absolute w-0 h-0" width="0" height="0">
        <defs>
          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6C3BFF" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#6C3BFF" stopOpacity={0.0} />
          </linearGradient>
        </defs>
      </svg>

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
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">Análisis Financiero</h1>
              </div>
            </div>
            {hasUSD && (
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setSelectedCurrency('ARS')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${selectedCurrency === 'ARS'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  Pesos ($)
                </button>
                <button
                  onClick={() => setSelectedCurrency('USD')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${selectedCurrency === 'USD'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  Dólares (US$)
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {transactions.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="pt-16 pb-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground mb-2">No hay transacciones para analizar</p>
              <p className="text-sm text-muted-foreground font-light mb-6">
                Agregá transacciones para ver gráficos y análisis detallados
              </p>
              <Link href="/dashboard/transactions">
                <Button className="shadow-sm font-medium">Ver Transacciones</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Month/Year Selector */}
            <Card className="border-0 shadow-md mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold tracking-tight">Resumen Mensual</CardTitle>
                <CardDescription className="font-light">Selecciona el mes y año para analizar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 items-center">
                  <Select value={currentYear} onValueChange={handleSelectedYearChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Año" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={currentMonth} onValueChange={handleSelectedMonthChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Mes" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => {
                        const monthNum = String(i + 1).padStart(2, '0')
                        return (
                          <SelectItem key={monthNum} value={monthNum}>
                            {getMonthName(monthNum)}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards con Censura Sincronizada */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              <Card className="border-0 shadow-md overflow-hidden">
                <div className="h-1 bg-emerald-500" />
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 font-medium">Ingresos</p>
                      <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                        {fmtHeaderCard(monthlyAnalytics.totalIncome)}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shadow-sm">
                      <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md overflow-hidden">
                <div className="h-1 bg-rose-500" />
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 font-medium">Gastos</p>
                      <p className="text-3xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">
                        {fmtHeaderCard(monthlyAnalytics.totalExpense)}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shadow-sm">
                      <TrendingDown className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md overflow-hidden">
                <div className={`h-1 ${monthlyAnalytics.balance >= 0 ? 'bg-violeta-principal' : 'bg-orange-500'}`} />
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 font-medium">Balance</p>
                      <p className={`text-3xl font-bold tracking-tight ${monthlyAnalytics.balance >= 0 ? 'text-violeta-principal' : 'text-orange-600 dark:text-orange-400'}`}>
                        {fmtHeaderCard(monthlyAnalytics.balance)}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${monthlyAnalytics.balance >= 0 ? 'bg-violeta-principal/10' : 'bg-orange-100 dark:bg-orange-900/30'
                      }`}>
                      <DollarSign className={`w-6 h-6 ${monthlyAnalytics.balance >= 0 ? 'text-violeta-principal' : 'text-orange-600 dark:text-orange-400'}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gastos por Categoría */}
            {monthlyAnalytics.expensesByCategory.length > 0 && (
              <Card className="border-0 shadow-md mb-6">
                <div className="h-1 bg-violeta-principal rounded-t-lg" />
                <CardHeader className="pt-5">
                  <CardTitle className="text-base font-bold tracking-tight">Gastos por Categoría</CardTitle>
                  <CardDescription className="font-light">Distribución de gastos en {getMonthName(currentMonth)} {currentYear}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                    <div className="h-[280px] w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={monthlyAnalytics.expensesByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#6C3BFF"
                            dataKey="value"
                          >
                            {monthlyAnalytics.expensesByCategory.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ borderRadius: '12px', background: 'var(--card)', borderColor: 'var(--border)' }}
                            formatter={(value) => fmt(value as number)}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {monthlyAnalytics.expensesByCategory.map((category: any, index: number) => {
                        const percentage = ((category.value / monthlyAnalytics.totalExpense) * 100).toFixed(1);
                        return (
                          <div key={index} className="flex items-center justify-between bg-muted/30 p-3 rounded-xl border border-border/40">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="font-medium text-sm text-foreground truncate">
                                {category.name}
                              </span>
                            </div>
                            <div className="text-right shrink-0 pl-4">
                              <span className="font-semibold text-sm text-foreground block">
                                {fmt(category.value)}
                              </span>
                              <span className="text-xs text-muted-foreground font-light">
                                {percentage}%
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tendencia Anual */}
            {analytics.transactionsByMonth.length > 0 && (
              <Card className="border-0 shadow-md mb-6">
                <div className="h-1 bg-violeta-claro rounded-t-lg" />
                <CardHeader className="pt-5">
                  <CardTitle className="text-base font-bold tracking-tight">Tendencia Anual</CardTitle>
                  <CardDescription className="font-light">Ingresos vs Gastos por mes (últimos 12 meses)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={analytics.transactionsByMonth} barGap={6}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-5" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'currentColor' }} tickLine={false} axisLine={false} dy={8} />
                      <YAxis tick={{ fontSize: 11, fill: 'currentColor' }} tickLine={false} axisLine={false} dx={-8} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', background: 'var(--card)', borderColor: 'var(--border)' }}
                        formatter={(value) => fmt(value as number)}
                      />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: 12, fontSize: '13px' }} />

                      <Bar dataKey="income" fill="#10B981" name="Ingresos" radius={[6, 6, 0, 0]} maxBarSize={28} />
                      <Bar dataKey="expense" fill="#EF4444" name="Gastos" radius={[6, 6, 0, 0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Tendencia Diaria */}
            {monthlyAnalytics.dailyTrend.length > 0 && (
              <Card className="border-0 shadow-md">
                <div className="h-1 bg-azul-profundo dark:bg-violeta-principal rounded-t-lg" />
                <CardHeader className="pt-5">
                  <CardTitle className="text-base font-bold tracking-tight">Tendencia Diaria — {getMonthName(currentMonth)} {currentYear}</CardTitle>
                  <CardDescription className="font-light">Evolución del capital corriente y balance acumulado a lo largo del mes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={360}>
                    <AreaChart data={monthlyAnalytics.dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-5" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'currentColor' }} tickLine={false} axisLine={false} dy={8} />
                      <YAxis tick={{ fontSize: 11, fill: 'currentColor' }} tickLine={false} axisLine={false} dx={-8} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', background: 'var(--card)', borderColor: 'var(--border)' }}
                        formatter={(value) => fmt(value as number)}
                      />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: 12, fontSize: '13px' }} />

                      <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#6C3BFF"
                        fill="url(#colorBalance)"
                        name="Balance Disponible"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#6C3BFF' }}
                      />

                      <Area
                        type="monotone"
                        dataKey="income"
                        stroke="#10B981"
                        fill="url(#colorIncome)"
                        name="Ingresos Totales"
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0, fill: '#10B981' }}
                      />

                      <Area
                        type="monotone"
                        dataKey="expense"
                        stroke="#EF4444"
                        fill="url(#colorExpense)"
                        name="Gastos Totales"
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0, fill: '#EF4444' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  )
}