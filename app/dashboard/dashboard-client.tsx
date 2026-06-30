'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, Plus, TrendingUp, TrendingDown, Wallet, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface DashboardClientProps {
  user: any
  profile: any
}

export default function DashboardClient({ user, profile }: DashboardClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Get transactions for this month
      const today = new Date()
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', firstDay.toISOString().split('T')[0])

      if (transactions) {
        const income = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0)
        
        const expense = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0)

        setStats({
          totalIncome: income,
          totalExpense: expense,
          balance: income - expense,
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-foreground">FinanceHub</h1>
                <p className="text-xs text-muted-foreground">Gestión Financiera</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-medium text-sm text-foreground">{profile.full_name || user.email}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {profile.role === 'advisor' ? 'Asesor Financiero' : 'Cliente'}
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Bienvenido, {profile.full_name?.split(' ')[0] || 'Usuario'}
          </h2>
          <p className="text-muted-foreground">
            Aquí puedes gestionar tus finanzas de forma simple e intuitiva
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Income Card */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Ingresos este mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                ${stats.totalIncome.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">+12% respecto al mes anterior</p>
            </CardContent>
          </Card>

          {/* Expense Card */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                Gastos este mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">
                ${stats.totalExpense.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">+5% respecto al mes anterior</p>
            </CardContent>
          </Card>

          {/* Balance Card */}
          <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${stats.balance.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.balance >= 0 ? 'Presupuesto positivo' : 'Presupuesto negativo'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Actions Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Gestiona tus transacciones y datos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/dashboard/transactions">
                  <Button className="w-full" size="lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Transacción
                  </Button>
                </Link>
                <Link href="/dashboard/categories">
                  <Button variant="outline" className="w-full" size="lg">
                    Gestionar Categorías
                  </Button>
                </Link>
                <Link href="/dashboard/analytics">
                  <Button variant="outline" className="w-full" size="lg">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Ver Análisis
                  </Button>
                </Link>
                {profile.role === 'client' && (
                  <Link href="/dashboard/advisors">
                    <Button variant="outline" className="w-full" size="lg">
                      Mi Asesor Financiero
                    </Button>
                  </Link>
                )}
                {profile.role === 'advisor' && (
                  <Link href="/dashboard/clients">
                    <Button variant="outline" className="w-full" size="lg">
                      Mis Clientes
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Información</CardTitle>
              <CardDescription>Tu cuenta y configuración</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Correo electrónico</p>
                  <p className="font-medium text-foreground">{user.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Nombre</p>
                  <p className="font-medium text-foreground">{profile.full_name || 'No configurado'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tipo de cuenta</p>
                  <p className="font-medium text-foreground capitalize">
                    {profile.role === 'advisor' ? 'Asesor Financiero' : profile.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </p>
                </div>
                <Link href="/dashboard/settings">
                  <Button variant="outline" className="w-full mt-4">
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
