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

            <Link href="/" className="flex items-center group">
              <img
                src="/logo.png"
                alt="Logo de Valum"
                className="h-9 md:h-11 w-auto object-contain transition-all duration-200 group-hover:scale-[1.02] group-hover:opacity-95"
              />
            </Link>

            {/* Botones de la Derecha */}
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="cursor-pointer">
                {/* Cambiado a variant="outline" con borde sutil para que no se camufle */}
                <Button variant="outline" size="sm" className="cursor-pointer border-border/80 bg-background/50 text-foreground hover:bg-muted font-medium px-4 rounded-md transition-all">
                  Inicia sesión
                </Button>
              </Link>
              <Link href="/auth/sign-up" className="cursor-pointer">
                <Button size="sm" className="cursor-pointer bg-primary text-primary-foreground hover:opacity-90 font-medium px-4 rounded-md transition-all shadow-sm">
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
            Tu plataforma de <span className="text-violeta-principal">gestión financiera</span>
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-foreground mb-4">
            Características principales
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Todo lo que necesitas para gestionar tus finanzas de forma inteligente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Feature 1 - Violeta Principal */}
          <div className="group cursor-pointer">
            <div className="h-full rounded-2xl bg-gradient-to-br from-violeta-principal/5 to-violeta-principal/10 dark:from-violeta-principal/10 dark:to-violeta-principal/5 border-2 border-violeta-principal/20 dark:border-violeta-principal/30 p-8 hover:shadow-2xl hover:border-violeta-principal/40 dark:hover:border-violeta-principal/50 transition-all duration-300">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violeta-principal to-violeta-principal/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <BarChart3 className="w-9 h-9 text-white" />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-3">
                Análisis Detallado
              </h4>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Visualiza tus patrones de gastos con gráficos interactivos y análisis comparativos en tiempo real.
              </p>
            </div>
          </div>

          {/* Feature 2 - Violeta Claro */}
          <div className="group cursor-pointer">
            <div className="h-full rounded-2xl bg-gradient-to-br from-violeta-claro/5 to-violeta-claro/10 dark:from-violeta-claro/10 dark:to-violeta-claro/5 border-2 border-violeta-claro/20 dark:border-violeta-claro/30 p-8 hover:shadow-2xl hover:border-violeta-claro/40 dark:hover:border-violeta-claro/50 transition-all duration-300">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violeta-claro to-violeta-claro/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Users className="w-9 h-9 text-white" />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-3">
                Asesoría Profesional
              </h4>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Conecta con asesores financieros expertos y obtén recommendations personalizadas para tu situación.
              </p>
            </div>
          </div>

          {/* Feature 3 - Violeta Principal */}
          <div className="group cursor-pointer">
            <div className="h-full rounded-2xl bg-gradient-to-br from-violeta-principal/5 to-violeta-principal/10 dark:from-violeta-principal/10 dark:to-violeta-principal/5 border-2 border-violeta-principal/20 dark:border-violeta-principal/30 p-8 hover:shadow-2xl hover:border-violeta-principal/40 dark:hover:border-violeta-principal/50 transition-all duration-300">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violeta-principal to-violeta-principal/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Zap className="w-9 h-9 text-white" />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-3">
                Gestión Rápida
              </h4>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Registra transacciones en segundos con nuestra interfaz intuitiva y amigable.
              </p>
            </div>
          </div>

          {/* Feature 4 - Violeta Claro */}
          <div className="group cursor-pointer">
            <div className="h-full rounded-2xl bg-gradient-to-br from-violeta-claro/5 to-violeta-claro/10 dark:from-violeta-claro/10 dark:to-violeta-claro/5 border-2 border-violeta-claro/20 dark:border-violeta-claro/30 p-8 hover:shadow-2xl hover:border-violeta-claro/40 dark:hover:border-violeta-claro/50 transition-all duration-300">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violeta-claro to-violeta-claro/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Lock className="w-9 h-9 text-white" />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-3">
                Datos Seguros
              </h4>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Tu información está protegida con encriptación de nivel empresarial y privacidad garantizada.
              </p>
            </div>
          </div>

          {/* Feature 5 - Violeta Principal */}
          <div className="group cursor-pointer">
            <div className="h-full rounded-2xl bg-gradient-to-br from-violeta-principal/5 to-violeta-principal/10 dark:from-violeta-principal/10 dark:to-violeta-principal/5 border-2 border-violeta-principal/20 dark:border-violeta-principal/30 p-8 hover:shadow-2xl hover:border-violeta-principal/40 dark:hover:border-violeta-principal/50 transition-all duration-300">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violeta-principal to-violeta-principal/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <TrendingUp className="w-9 h-9 text-white" />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-3">
                Metas Financieras
              </h4>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Define presupuestos y metas claras para mejorar continuamente tu situación financiera.
              </p>
            </div>
          </div>

          {/* Feature 6 - Violeta Claro */}
          <div className="group cursor-pointer">
            <div className="h-full rounded-2xl bg-gradient-to-br from-violeta-claro/5 to-violeta-claro/10 dark:from-violeta-claro/10 dark:to-violeta-claro/5 border-2 border-violeta-claro/20 dark:border-violeta-claro/30 p-8 hover:shadow-2xl hover:border-violeta-claro/40 dark:hover:border-violeta-claro/50 transition-all duration-300">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violeta-claro to-violeta-claro/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Shield className="w-9 h-9 text-white" />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-3">
                Notificaciones
              </h4>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Recibe alertas personalizadas en tiempo real sobre movimientos importantes en tu cuenta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-2xl bg-gradient-to-r from-violeta-principal to-violeta-claro p-12 md:p-16 text-center text-white shadow-2xl">
          <h3 className="text-4xl font-bold mb-4">
            ¿Listo para mejorar tus finanzas?
          </h3>
          <p className="text-white/90 max-w-2xl mx-auto mb-10 text-lg">
            Únete a miles de usuarios que ya están transformando su relación con el dinero. Sin verificación de email, acceso inmediato.
          </p>
          <Link href="/auth/sign-up" className="cursor-pointer inline-block">
            <Button size="lg" className="text-lg bg-white text-violeta-principal hover:bg-white/90 cursor-pointer transition-all shadow-lg">
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
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                Privacidad
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                Términos
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}