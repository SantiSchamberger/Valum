import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, BarChart3, Users, Shield, Zap, Lock } from 'lucide-react'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-foreground">Valum</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="cursor-pointer">
                <Button variant="ghost" size="sm" className="cursor-pointer hover:bg-muted">
                  Inicia sesión
                </Button>
              </Link>
              <Link href="/auth/sign-up" className="cursor-pointer">
                <Button size="sm" className="cursor-pointer hover:opacity-90 transition-opacity">
                  Regístrate
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-6 text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Tu plataforma de <span className="text-primary">gestión financiera</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Controla tus finanzas, analiza tus gastos y recibe asesoramiento profesional en una sola plataforma amigable e intuitiva.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/auth/sign-up" className="cursor-pointer">
              <Button size="lg" className="text-lg cursor-pointer hover:opacity-90 transition-opacity shadow-lg">
                Comenzar Gratis
              </Button>
            </Link>
            <Link href="/auth/login" className="cursor-pointer">
              <Button size="lg" variant="outline" className="text-lg cursor-pointer hover:bg-muted transition-colors">
                Inicia sesión
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-b from-background to-background">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-foreground mb-4">
            Características principales
          </h3>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Todo lo que necesitas para gestionar tus finanzas de forma inteligente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group cursor-pointer">
            <div className="h-full rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 hover:shadow-xl transition-all duration-300 hover:border-primary/50">
              <div className="w-14 h-14 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-2">
                Análisis Detallado
              </h4>
              <p className="text-foreground/70">
                Visualiza tus patrones de gastos con gráficos interactivos y análisis comparativos en tiempo real.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group cursor-pointer">
            <div className="h-full rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 hover:shadow-xl transition-all duration-300 hover:border-secondary/50">
              <div className="w-14 h-14 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-2">
                Asesoría Profesional
              </h4>
              <p className="text-foreground/70">
                Conecta con asesores financieros expertos y obtén recomendaciones personalizadas para tu situación.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group cursor-pointer">
            <div className="h-full rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 hover:shadow-xl transition-all duration-300 hover:border-primary/50">
              <div className="w-14 h-14 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-2">
                Gestión Rápida
              </h4>
              <p className="text-foreground/70">
                Registra transacciones en segundos con nuestra interfaz intuitiva y amigable.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="group cursor-pointer">
            <div className="h-full rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 hover:shadow-xl transition-all duration-300 hover:border-secondary/50">
              <div className="w-14 h-14 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-8 h-8 text-secondary" />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-2">
                Datos Seguros
              </h4>
              <p className="text-foreground/70">
                Tu información está protegida con encriptación de nivel empresarial y privacidad garantizada.
              </p>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="group cursor-pointer">
            <div className="h-full rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 hover:shadow-xl transition-all duration-300 hover:border-primary/50">
              <div className="w-14 h-14 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-2">
                Metas Financieras
              </h4>
              <p className="text-foreground/70">
                Define presupuestos y metas claras para mejorar continuamente tu situación financiera.
              </p>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="group cursor-pointer">
            <div className="h-full rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 hover:shadow-xl transition-all duration-300 hover:border-secondary/50">
              <div className="w-14 h-14 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-secondary" />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-2">
                Notificaciones
              </h4>
              <p className="text-foreground/70">
                Recibe alertas personalizadas en tiempo real sobre movimientos importantes en tu cuenta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-secondary p-12 md:p-16 text-center text-white shadow-2xl">
          <h3 className="text-4xl font-bold mb-4">
            ¿Listo para mejorar tus finanzas?
          </h3>
          <p className="text-white/90 max-w-2xl mx-auto mb-10 text-lg">
            Únete a miles de usuarios que ya están transformando su relación con el dinero. Sin verificación de email, acceso inmediato.
          </p>
          <Link href="/auth/sign-up" className="cursor-pointer inline-block">
            <Button size="lg" className="text-lg bg-white text-primary hover:bg-white/90 cursor-pointer transition-all shadow-lg">
              Crear Cuenta Gratuita
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2026 Valum. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-foreground/70 hover:text-foreground cursor-pointer transition-colors">
                Privacidad
              </Link>
              <Link href="#" className="text-sm text-foreground/70 hover:text-foreground cursor-pointer transition-colors">
                Términos
              </Link>
              <Link href="#" className="text-sm text-foreground/70 hover:text-foreground cursor-pointer transition-colors">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
