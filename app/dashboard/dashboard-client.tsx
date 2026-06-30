'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface DashboardClientProps {
  user: {
    id: string
    email?: string
    user_metadata?: {
      full_name?: string
    }
  }
  profile?: {
    id: string
    email: string
    full_name?: string
    role?: string
  }
}

export default function DashboardClient({ user, profile }: DashboardClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email || 'Usuario'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-foreground">Valum</h1>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {displayName}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoading}
              >
                {isLoading ? 'Cerrando...' : 'Cerrar sesión'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Welcome Section */}
          <section>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              ¡Bienvenido, {displayName}!
            </h2>
            <p className="text-muted-foreground">
              Aquí es donde comenzarás a gestionar tus finanzas.
            </p>
          </section>

          {/* Dashboard Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder cards for future features */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground mb-2">Saldo Total</h3>
              <p className="text-3xl font-bold text-primary">$0.00</p>
              <p className="text-xs text-muted-foreground mt-2">
                Próximamente
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground mb-2">Gastos este mes</h3>
              <p className="text-3xl font-bold text-red-600">$0.00</p>
              <p className="text-xs text-muted-foreground mt-2">
                Próximamente
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground mb-2">Ingresos este mes</h3>
              <p className="text-3xl font-bold text-green-600">$0.00</p>
              <p className="text-xs text-muted-foreground mt-2">
                Próximamente
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
