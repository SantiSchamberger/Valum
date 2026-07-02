'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, Plus, TrendingUp, TrendingDown, Wallet, BarChart3, Users, DollarSign, RefreshCw, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

interface DashboardClientProps {
  user: any
  profile: any
}

export default function DashboardClient({ user, profile }: DashboardClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [previousRate, setPreviousRate] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshingRate, setIsRefreshingRate] = useState(false)
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [tipHistory, setTipHistory] = useState<number[]>([])
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; created_at: string; admin_email: string; admin_name?: string }>>([])

  // Estado para controlar la visibilidad de los saldos (Censura)
  const [hideBalances, setHideBalances] = useState(false)

  const [stats, setStats] = useState({
    totalIncomeARS: 0,
    totalExpenseARS: 0,
    balanceARS: 0,
    totalIncomeUSD: 0,
    totalExpenseUSD: 0,
    balanceUSD: 0,
    hasUSD: false,
  })

  const financialTips = [
    'Ahorra al menos el 10% de tus ingresos mensuales y revísalo cada mes.',
    'Controla tus gastos prioritarios primero: vivienda, alimento y salud.',
    'Usá presupuestos semanales para no gastar de más en salidas y compras impulsivas.',
    'Dedica tiempo a comparar precios antes de una compra importante.',
    'Guarda un fondo de emergencia con al menos 3 meses de gastos fijos.',
    'Paga primero las deudas con mayores tasas de interés.',
    'Revisa tus metas financieras cada trimestre y ajusta tu plan.',
    'Contacta con tu asesor de confianza para optimizar tus inversiones y ahorros.',
  ]

  const getNextTipIndex = (seen: number[]) => {
    const available = financialTips
      .map((_, index) => index)
      .filter(index => !seen.includes(index))

    if (available.length === 0) {
      return Math.floor(Math.random() * financialTips.length)
    }

    return available[Math.floor(Math.random() * available.length)]
  }

  const persistTipHistory = (history: number[]) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('valumTipHistory', JSON.stringify(history))
  }

  const loadTipHistory = () => {
    if (typeof window === 'undefined') return [] as number[]
    try {
      const stored = JSON.parse(localStorage.getItem('valumTipHistory') || '[]') as number[]
      return Array.isArray(stored) ? stored.filter(i => typeof i === 'number' && i >= 0 && i < financialTips.length) : []
    } catch {
      return []
    }
  }

  const fetchExchangeRate = async () => {
    try {
      setIsRefreshingRate(true)
      const response = await fetch('/api/get-exchange-rate')
      const data = await response.json()
      const currentRate = typeof data.rate === 'number' ? data.rate : null
      setExchangeRate(currentRate)
      setLastUpdated(new Date())

      const { data: history } = await supabase
        .from('exchange_rates')
        .select('rate,date')
        .eq('currency_from', 'USD')
        .eq('currency_to', 'ARS')
        .order('date', { ascending: false })
        .limit(2)

      if (history && history.length > 1) {
        setPreviousRate(history[1].rate)
      } else {
        setPreviousRate(null)
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error)
      setPreviousRate(null)
    } finally {
      setIsRefreshingRate(false)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchExchangeRate()
    fetchNotifications()

    // Cargar la preferencia de privacidad del usuario al entrar
    if (typeof window !== 'undefined') {
      const storedPrivacy = localStorage.getItem('valumHideBalances') === 'true'
      setHideBalances(storedPrivacy)
    }

    const interval = setInterval(() => {
      fetchExchangeRate()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedHistory = loadTipHistory()
    const initialIndex = getNextTipIndex(storedHistory)
    const initialHistory = storedHistory.includes(initialIndex)
      ? storedHistory
      : [...storedHistory, initialIndex]

    setCurrentTipIndex(initialIndex)
    setTipHistory(initialHistory)
    persistTipHistory(initialHistory)

    const tipInterval = setInterval(() => {
      setCurrentTipIndex((currentIndex) => {
        const currentHistory = loadTipHistory()
        const nextIndex = getNextTipIndex(currentHistory)
        const nextHistory = currentHistory.includes(nextIndex) ? currentHistory : [...currentHistory, nextIndex]
        persistTipHistory(nextHistory.length >= financialTips.length ? [nextIndex] : nextHistory)
        setTipHistory(nextHistory.length >= financialTips.length ? [nextIndex] : nextHistory)
        return nextIndex
      })
    }, 10000)

    return () => clearInterval(tipInterval)
  }, [financialTips.length])

  const fetchStats = async () => {
    try {
      const today = new Date()
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)

      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', firstDay.toISOString().split('T')[0])

      if (transactions) {
        const incomeARS = transactions
          .filter(t => t.type === 'income' && (!t.currency || t.currency === 'ARS'))
          .reduce((sum, t) => sum + parseFloat(t.amount), 0)
        const expenseARS = transactions
          .filter(t => t.type === 'expense' && (!t.currency || t.currency === 'ARS'))
          .reduce((sum, t) => sum + parseFloat(t.amount), 0)
        const incomeUSD = transactions
          .filter(t => t.type === 'income' && t.currency === 'USD')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0)
        const expenseUSD = transactions
          .filter(t => t.type === 'expense' && t.currency === 'USD')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0)
        const hasUSD = transactions.some(t => t.currency === 'USD')

        setStats({
          totalIncomeARS: incomeARS,
          totalExpenseARS: expenseARS,
          balanceARS: incomeARS - expenseARS,
          totalIncomeUSD: incomeUSD,
          totalExpenseUSD: expenseUSD,
          balanceUSD: incomeUSD - expenseUSD,
          hasUSD,
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('id,title,message,created_at,admin_name,admin_email')
        .order('created_at', { ascending: false })
        .limit(4)

      if (data) {
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  // Alterna y persiste la visibilidad de los saldos
  const togglePrivacy = () => {
    const nextState = !hideBalances
    setHideBalances(nextState)
    localStorage.setItem('valumHideBalances', String(nextState))
  }

  const change = exchangeRate !== null && previousRate !== null ? exchangeRate - previousRate : null

  const changePercent = change !== null && previousRate !== null
    ? new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((change / previousRate) * 100)
    : null

  // Modificado: Si la privacidad está activa, reemplaza el monto por puntos de censura
  const formatAmount = (amount: number, currency: 'ARS' | 'USD' = 'ARS') => {
    if (hideBalances) {
      return currency === 'USD' ? 'US$ ••••••' : '$ ••••••'
    }

    const formattedNumber = new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)

    return currency === 'USD' ? `US$${formattedNumber}` : `$${formattedNumber}`
  }

  const formatRate = (value: number) => {
    return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violeta-principal to-violeta-claro flex items-center justify-center shadow-md">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-foreground tracking-tight">Valum</h1>
                <p className="text-xs text-muted-foreground font-light">Gestión Financiera</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-medium text-sm text-foreground">{profile.full_name || user.email}</p>
                <p className="text-xs text-muted-foreground capitalize font-light">
                  {profile.role === 'advisor' ? 'Asesor Financiero' : profile.role === 'admin' ? 'Administrador' : 'Cliente'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoading}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section con el Botón del Ojito */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight mb-2">
              Bienvenido, {profile.full_name?.split(' ')[0] || 'Usuario'}
            </h2>
            <p className="text-muted-foreground font-light">
              Aquí podés gestionar tus finanzas de forma simple e intuitiva
            </p>
          </div>

          {/* BOTÓN REGULADOR DE PRIVACIDAD (Ojito de Mercado Pago) */}
          <Button
            variant="outline"
            size="icon"
            onClick={togglePrivacy}
            className="rounded-xl w-11 h-11 border-border bg-card shadow-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 shrink-0 transition-all"
            title={hideBalances ? "Mostrar saldos" : "Ocultar saldos"}
          >
            {hideBalances ? <EyeOff className="w-5 h-5 text-violeta-principal" /> : <Eye className="w-5 h-5" />}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Income Card */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-1 w-full bg-emerald-500" />
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                Ingresos este mes
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {formatAmount(stats.totalIncomeARS)}
              </p>
              {stats.hasUSD && stats.totalIncomeUSD > 0 && (
                <p className="text-sm font-medium text-emerald-500 mt-0.5">
                  + {formatAmount(stats.totalIncomeUSD, 'USD')}
                </p>
              )}
              <p className="text-xs text-muted-foreground font-light mt-2">Mes actual en pesos</p>
            </CardContent>
          </Card>

          {/* Expense Card */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-1 w-full bg-rose-500" />
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                </div>
                Gastos este mes
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-3xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">
                {formatAmount(stats.totalExpenseARS)}
              </p>
              {stats.hasUSD && stats.totalExpenseUSD > 0 && (
                <p className="text-sm font-medium text-rose-500 mt-0.5">
                  + {formatAmount(stats.totalExpenseUSD, 'USD')}
                </p>
              )}
              <p className="text-xs text-muted-foreground font-light mt-2">Mes actual en pesos</p>
            </CardContent>
          </Card>

          {/* Balance Card */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className={`h-1 w-full ${stats.balanceARS >= 0 ? 'bg-violeta-principal' : 'bg-orange-500'}`} />
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stats.balanceARS >= 0 ? 'bg-violeta-principal/10' : 'bg-orange-100 dark:bg-orange-900/40'}`}>
                  <Wallet className={`w-4 h-4 ${stats.balanceARS >= 0 ? 'text-violeta-principal' : 'text-orange-600 dark:text-orange-400'}`} />
                </div>
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <p className={`text-3xl font-bold tracking-tight ${stats.balanceARS >= 0 ? 'text-violeta-principal' : 'text-orange-600 dark:text-orange-400'}`}>
                {formatAmount(stats.balanceARS)}
              </p>
              {stats.hasUSD && (
                <p className={`text-sm font-medium mt-0.5 ${stats.balanceUSD >= 0 ? 'text-violeta-claro' : 'text-orange-500'}`}>
                  {formatAmount(stats.balanceUSD, 'USD')}
                </p>
              )}
              <p className="text-xs text-muted-foreground font-light mt-2">
                {stats.balanceARS >= 0 ? 'Presupuesto positivo' : 'Presupuesto negativo'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Exchange Rate + Tips + Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {exchangeRate !== null && (
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 w-full bg-violeta-principal" />
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-violeta-principal/10 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-violeta-principal" />
                  </div>
                  Tipo de Cambio Oficial
                </CardTitle>
                <CardDescription className="font-light">Último cambio oficial</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-3xl font-bold text-violeta-principal tracking-tight">
                      ${formatRate(exchangeRate)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 font-light">ARS por 1 USD</p>
                    {lastUpdated && (
                      <p className="text-xs text-muted-foreground font-light mt-2">
                        Actualizado: {lastUpdated.toLocaleTimeString('es-AR')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={fetchExchangeRate}
                      disabled={isRefreshingRate}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="Actualizar"
                    >
                      <RefreshCw
                        className={`w-5 h-5 text-violeta-principal ${isRefreshingRate ? 'animate-spin' : ''}`}
                      />
                    </button>
                    <div className={`rounded-xl px-4 py-3 ${change !== null ? change >= 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' : 'bg-muted text-muted-foreground'}`}>
                      {change !== null ? (
                        <div className="flex items-center gap-2">
                          {change >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                          <div>
                            <p className="text-base font-semibold">
                              {change >= 0 ? '+' : ''}${formatRate(Math.abs(change))}
                            </p>
                            <p className="text-sm opacity-90 font-light">
                              {changePercent}% {change >= 0 ? 'subió' : 'bajó'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground font-light">Sin registro previo</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-1 w-full bg-violeta-claro" />
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-violeta-claro/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-violeta-claro" />
                </div>
                Consejo Financiero
              </CardTitle>
              <CardDescription className="font-light">Tip financiero rotativo</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-base font-medium text-foreground leading-relaxed">{financialTips[currentTipIndex]}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-1 w-full bg-azul-profundo dark:bg-violeta-principal" />
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-foreground/70" />
                </div>
                Mensajes de Administrador
              </CardTitle>
              <CardDescription className="font-light">Últimos avisos desde administración</CardDescription>
            </CardHeader>
            <CardContent className="pb-4 space-y-4">
              {notifications.length > 0 ? (
                notifications.map((note) => (
                  <div key={note.id} className="rounded-xl border border-border bg-card/80 p-4">
                    <p className="font-semibold text-foreground tracking-tight">{note.title}</p>
                    <p className="text-sm text-muted-foreground font-light mt-1">{note.message}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground font-light">
                      <span>{new Date(note.created_at).toLocaleDateString('es-AR')}</span>
                      <span>Por {note.admin_name || note.admin_email}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground font-light">No hay mensajes recientes.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-bold tracking-tight">Acciones Rápidas</CardTitle>
              <CardDescription className="font-light">Gestioná tus transacciones y datos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <Link href="/dashboard/transactions">
                  <Button className="w-full shadow-sm hover:shadow-md font-medium" size="lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Transacción
                  </Button>
                </Link>
                <Link href="/dashboard/categories">
                  <Button variant="outline" className="w-full hover:shadow-sm font-medium" size="lg">
                    Gestionar Categorías
                  </Button>
                </Link>
                <Link href="/dashboard/analytics">
                  <Button variant="outline" className="w-full hover:shadow-sm font-medium" size="lg">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Ver Análisis
                  </Button>
                </Link>
                <Link href="/dashboard/exchange-rates">
                  <Button variant="outline" className="w-full hover:shadow-sm font-medium" size="lg">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Tipo de Cambio
                  </Button>
                </Link>
                {profile.role === 'client' && (
                  <Link href="/dashboard/advisors">
                    <Button variant="outline" className="w-full hover:shadow-sm font-medium" size="lg">
                      <Users className="w-4 h-4 mr-2" />
                      Mi Asesor Financiero
                    </Button>
                  </Link>
                )}
                {(profile.role === 'advisor' || profile.role === 'admin') && (
                  <Link href="/dashboard/advisors">
                    <Button
                      variant="outline"
                      className="w-full border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800/60 dark:text-emerald-400 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 hover:shadow-sm font-medium transition-all"
                      size="lg"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Asesores Financieros
                    </Button>
                  </Link>
                )}
                {(profile.role === 'advisor' || profile.role === 'admin') && (
                  <Link href="/dashboard/clients">
                    <Button variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/30 font-medium" size="lg">
                      Mis Clientes
                    </Button>
                  </Link>
                )}
                {profile.role === 'admin' && (
                  <Link href="/dashboard/admin">
                    <Button variant="outline" className="w-full border-violeta-principal/30 text-violeta-principal hover:bg-violeta-principal/5 dark:border-violeta-principal/50 dark:text-violeta-claro font-medium" size="lg">
                      Panel de Administración
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-bold tracking-tight">Información</CardTitle>
              <CardDescription className="font-light">Tu cuenta y configuración</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground font-light mb-0.5">Correo electrónico</p>
                  <p className="font-medium text-foreground">{user.email}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground font-light mb-0.5">Nombre</p>
                  <p className="font-medium text-foreground">{profile.full_name || 'No configurado'}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground font-light mb-0.5">Tipo de cuenta</p>
                  <p className="font-medium text-foreground capitalize">
                    {profile.role === 'advisor' ? 'Asesor Financiero' : profile.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </p>
                </div>
                <Link href="/dashboard/settings">
                  <Button variant="outline" className="w-full mt-2 hover:shadow-sm font-medium">
                    Editar Perfil
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}