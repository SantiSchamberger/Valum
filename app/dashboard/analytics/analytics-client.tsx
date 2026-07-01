'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
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

export default function AnalyticsClient({
  user,
  transactions,
  categories,
}: AnalyticsClientProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<'ARS' | 'USD'>('ARS')
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('')

  // Initialize selected month and year to current
  const now = new Date()
  const defaultMonth = String(now.getMonth() + 1).padStart(2, '0')
  const defaultYear = String(now.getFullYear())

  const currentMonth = selectedMonth || defaultMonth
  const currentYear = selectedYear || defaultYear

  const hasUSD = useMemo(() => transactions.some(t => t.currency === 'USD'), [transactions])

  const filteredTransactions = useMemo(
    () => transactions.filter(t => !t.currency || t.currency === selectedCurrency),
    [transactions, selectedCurrency]
  )

  // Get unique years from transactions
  const years = useMemo(() => {
    const yearSet = new Set(transactions.map(t => {
      const date = new Date(t.date)
      return date.getFullYear().toString()
    }))
    return Array.from(yearSet).sort((a, b) => Number(b) - Number(a))
  }, [transactions])

  // Get months in selected year
  const months = useMemo(() => {
    const monthSet = new Set(
      filteredTransactions
        .filter(t => {
          const date = new Date(t.date)
          return date.getFullYear().toString() === currentYear
        })
        .map(t => {
          const date = new Date(t.date)
          return String(date.getMonth() + 1).padStart(2, '0')
        })
    )
    return Array.from(monthSet).sort((a, b) => Number(b) - Number(a))
  }, [filteredTransactions, currentYear])

  const monthlyAnalytics = useMemo(() => {
    const monthTransactions = filteredTransactions.filter(t => {
      const date = new Date(t.date)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear().toString()
      return month === currentMonth && year === currentYear
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
            color: t.categories?.color || '#3B82F6',
          })
        }
        return acc
      }, [])

    const dailyTrend = monthTransactions
      .reduce((acc: any, t) => {
        const date = new Date(t.date)
        const dayKey = date.toLocaleDateString('es-ES')
        const existing = acc.find((item: any) => item.date === dayKey)

        if (existing) {
          if (t.type === 'income') existing.income += t.amount
          else existing.expense += t.amount
        } else {
          acc.push({
            date: dayKey,
            income: t.type === 'income' ? t.amount : 0,
            expense: t.type === 'expense' ? t.amount : 0,
          })
        }
        return acc
      }, [])
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return { totalIncome, totalExpense, balance, expensesByCategory, dailyTrend, monthTransactions }
  }, [filteredTransactions, currentMonth, currentYear])

  // Also keep the annual analytics for the trend chart
  const analytics = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpense

    const transactionsByMonth = filteredTransactions.reduce((acc: any, t) => {
      const date = new Date(t.date)
      const monthKey = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
      const existing = acc.find((item: any) => item.month === monthKey)

      if (existing) {
        if (t.type === 'income') existing.income += t.amount
        else existing.expense += t.amount
      } else {
        acc.push({
          month: monthKey,
          income: t.type === 'income' ? t.amount : 0,
          expense: t.type === 'expense' ? t.amount : 0,
        })
      }
      return acc
    }, [])
      .sort((a: any, b: any) => {
        const dateA = new Date('01 ' + a.month)
        const dateB = new Date('01 ' + b.month)
        return dateA.getTime() - dateB.getTime()
      })
      .slice(-12)

    return { totalIncome, totalExpense, balance, transactionsByMonth }
  }, [filteredTransactions])

  const getMonthName = (monthNum: string) => {
    const date = new Date(2024, parseInt(monthNum) - 1)
    return date.toLocaleString('es-ES', { month: 'long' })
  }

  const currSymbol = selectedCurrency === 'USD' ? 'US$' : '$'
  const fmt = (v: number) => `${currSymbol}${v.toFixed(2)}`

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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Análisis Financiero</h1>
              </div>
            </div>
            {hasUSD && (
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setSelectedCurrency('ARS')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    selectedCurrency === 'ARS'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Pesos ($)
                </button>
                <button
                  onClick={() => setSelectedCurrency('USD')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    selectedCurrency === 'USD'
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
              <p className="text-sm text-muted-foreground mb-6">
                Agregá transacciones para ver gráficos y análisis detallados
              </p>
              <Link href="/dashboard/transactions">
                <Button className="shadow-sm">Ver Transacciones</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Month/Year Selector */}
            <Card className="border-0 shadow-md mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Resumen Mensual</CardTitle>
                <CardDescription>Selecciona el mes y año para analizar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 items-center">
                  <Select value={currentYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Año" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={currentMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Mes" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 12}, (_, i) => {
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

            {/* Summary Cards - Monthly */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              <Card className="border-0 shadow-md overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-emerald-400 to-green-500" />
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 font-medium">Ingresos</p>
                      <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        {fmt(monthlyAnalytics.totalIncome)}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shadow-sm">
                      <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-rose-400 to-red-500" />
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 font-medium">Gastos</p>
                      <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                        {fmt(monthlyAnalytics.totalExpense)}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shadow-sm">
                      <TrendingDown className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md overflow-hidden">
                <div className={`h-1 ${monthlyAnalytics.balance >= 0 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : 'bg-gradient-to-r from-orange-400 to-red-500'}`} />
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 font-medium">Balance</p>
                      <p className={`text-3xl font-bold ${monthlyAnalytics.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                        {fmt(monthlyAnalytics.balance)}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                      monthlyAnalytics.balance >= 0
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : 'bg-orange-100 dark:bg-orange-900/30'
                    }`}>
                      <DollarSign className={`w-6 h-6 ${monthlyAnalytics.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {monthlyAnalytics.expensesByCategory.length > 0 && (
                <Card className="border-0 shadow-md">
                  <div className="h-1 bg-gradient-to-r from-violet-400 to-purple-500 rounded-t-lg" />
                  <CardHeader className="pt-5">
                    <CardTitle className="text-base font-bold">Gastos por Categoría</CardTitle>
                    <CardDescription>Distribución de gastos en {getMonthName(currentMonth)} {currentYear}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {monthlyAnalytics.expensesByCategory.length === 0 ? (
                      <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                        No hay gastos registrados este mes
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={monthlyAnalytics.expensesByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${currSymbol}${value.toFixed(0)}`}
                            outerRadius={90}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {monthlyAnalytics.expensesByCategory.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => fmt(value as number)} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              )}

              {analytics.transactionsByMonth.length > 0 && (
                <Card className="border-0 shadow-md">
                  <div className="h-1 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-t-lg" />
                  <CardHeader className="pt-5">
                    <CardTitle className="text-base font-bold">Tendencia Anual</CardTitle>
                    <CardDescription>Ingresos vs Gastos por mes (últimos 12 meses)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={analytics.transactionsByMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => fmt(value as number)} />
                        <Legend />
                        <Bar dataKey="income" fill="#10B981" name="Ingresos" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" fill="#EF4444" name="Gastos" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            {monthlyAnalytics.dailyTrend.length > 0 && (
              <Card className="border-0 shadow-md">
                <div className="h-1 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-t-lg" />
                <CardHeader className="pt-5">
                  <CardTitle className="text-base font-bold">Tendencia Diaria — {getMonthName(currentMonth)} {currentYear}</CardTitle>
                  <CardDescription>Movimientos diarios de tu cuenta este mes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={360}>
                    <LineChart data={monthlyAnalytics.dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => fmt(value as number)} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="income"
                        stroke="#10B981"
                        name="Ingresos"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="expense"
                        stroke="#EF4444"
                        name="Gastos"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
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
