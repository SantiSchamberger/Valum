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
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Inicia sesión
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="sm">
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
            <Link href="/auth/sign-up">
              <Button size="lg" className="text-lg">
                Comenzar Gratis
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="text-lg">
                Inicia sesión
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Características principales
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Todo lo que necesitas para gestionar tus finanzas de forma inteligente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-xl hover:border-primary/40 transition-all hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Análisis Detallado</CardTitle>
              <CardDescription>Gráficos y reportes visuales de tus gastos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Visualiza tus patrones de gastos con gráficos interactivos y análisis comparativos.
              </p>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent hover:shadow-xl hover:border-secondary/40 transition-all hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle>Asesoría Profesional</CardTitle>
              <CardDescription>Conecta con asesores financieros expertos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Obtén recomendaciones personalizadas de profesionales con experiencia en finanzas.
              </p>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-xl hover:border-primary/40 transition-all hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Gestión Rápida</CardTitle>
              <CardDescription>Registra transacciones en segundos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Interfaz intuitiva que te permite registrar ingresos y gastos de forma rápida.
              </p>
            </CardContent>
          </Card>

          {/* Feature 4 */}
          <Card className="border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent hover:shadow-xl hover:border-secondary/40 transition-all hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle>Datos Seguros</CardTitle>
              <CardDescription>Encriptación de nivel empresarial</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Tu información está protegida con la máxima seguridad y privacidad garantizada.
              </p>
            </CardContent>
          </Card>

          {/* Feature 5 */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-xl hover:border-primary/40 transition-all hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Metas Financieras</CardTitle>
              <CardDescription>Establece y alcanza tus objetivos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Define presupuestos y metas para mejorar tu situación financiera.
              </p>
            </CardContent>
          </Card>

          {/* Feature 6 */}
          <Card className="border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent hover:shadow-xl hover:border-secondary/40 transition-all hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Alertas personalizadas en tiempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones sobre movimientos importantes y cambios en tu cuenta.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="border-2 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10">
          <CardContent className="pt-12 pb-12 text-center">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              ¿Listo para mejorar tus finanzas?
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Únete a miles de usuarios que ya están transformando su relación con el dinero.
            </p>
            <Link href="/auth/sign-up">
              <Button size="lg" className="text-lg">
                Crear Cuenta Gratuita
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2026 Valum. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacidad
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Términos
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
