'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
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
  // Calculate analytics
  const analytics = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpense

    // Group expenses by category
    const expensesByCategory = transactions
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

    // Group transactions by month
    const transactionsByMonth = transactions.reduce((acc: any, t) => {
      const date = new Date(t.date)
      const monthKey = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
      const existing = acc.find((item: any) => item.month === monthKey)

      if (existing) {
        if (t.type === 'income') {
          existing.income += t.amount
        } else {
          existing.expense += t.amount
        }
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
      .slice(-12) // Last 12 months

    // Daily trend (last 30 days)
    const dailyTrend = transactions
      .filter(t => {
        const date = new Date(t.date)
        const now = new Date()
        const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
        return daysAgo <= 30
      })
      .reduce((acc: any, t) => {
        const date = new Date(t.date)
        const dayKey = date.toLocaleDateString('es-ES')
        const existing = acc.find((item: any) => item.date === dayKey)

        if (existing) {
          if (t.type === 'income') {
            existing.income += t.amount
          } else {
            existing.expense += t.amount
          }
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

    return {
      totalIncome,
      totalExpense,
      balance,
      expensesByCategory,
      transactionsByMonth,
      dailyTrend,
    }
  }, [transactions])

  const COLORS = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#14B8A6',
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Análisis Financiero</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Income */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Ingresos Totales</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${analytics.totalIncome.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Expense */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Gastos Totales</p>
                  <p className="text-3xl font-bold text-red-600">
                    ${analytics.totalExpense.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balance */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Balance</p>
                  <p className={`text-3xl font-bold ${
                    analytics.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${analytics.balance.toFixed(2)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  analytics.balance >= 0
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  <DollarSign className={`w-6 h-6 ${
                    analytics.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gastos por Categoría */}
          {analytics.expensesByCategory.length > 0 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Gastos por Categoría</CardTitle>
                <CardDescription>Distribución de tus gastos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: $${value.toFixed(0)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.expensesByCategory.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${(value as number).toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Tendencia Mensual */}
          {analytics.transactionsByMonth.length > 0 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Tendencia Mensual</CardTitle>
                <CardDescription>Ingresos vs Gastos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.transactionsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${(value as number).toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="income" fill="#10B981" name="Ingresos" />
                    <Bar dataKey="expense" fill="#EF4444" name="Gastos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Daily Trend */}
        {analytics.dailyTrend.length > 0 && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Tendencia Diaria (Últimos 30 días)</CardTitle>
              <CardDescription>Movimientos diarios de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${(value as number).toFixed(2)}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10B981"
                    name="Ingresos"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#EF4444"
                    name="Gastos"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {transactions.length === 0 && (
          <Card className="border-2">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground mb-4">No hay transacciones para analizar</p>
              <p className="text-sm text-muted-foreground mb-6">
                Agrega transacciones para ver gráficos y análisis
              </p>
              <Link href="/dashboard/transactions">
                <Button>Ver Transacciones</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
