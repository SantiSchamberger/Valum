'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.log('[Valum] Login error:', error.message)
        throw error
      }

      if (data?.user) {
        console.log('[Valum] Login successful, user:', data.user.id)

        // Wait briefly for cookies to write to browser
        await new Promise(resolve => setTimeout(resolve, 300))

        console.log('[Valum] Redirecting to /dashboard')
        window.location.href = '/dashboard'
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error al iniciar sesión'
      console.log('[Valum] Login exception:', errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">

          {/* Contenedor del Logo Corporativo */}
          <div className="flex justify-center mb-2">
            <Link href="/" className="transition-transform duration-200 hover:scale-[1.02]">
              <img
                src="/logo.png"
                alt="Logo de Valum"
                className="h-12 w-auto object-contain"
              />
            </Link>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-3xl font-bold tracking-tight">Inicia sesión</CardTitle>
              <CardDescription className="font-light">
                Accede a tu plataforma de gestión financiera
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="font-medium">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="font-medium">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  )}
                  <Button
                    type="submit"
                    className="w-full font-medium"
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? 'Iniciando sesión...' : 'Inicia sesión'}
                  </Button>
                </div>
                <div className="mt-6 text-center text-sm text-muted-foreground font-light">
                  ¿No tienes cuenta?{' '}
                  <Link
                    href="/auth/sign-up"
                    className="font-medium text-primary hover:underline"
                  >
                    Regístrate
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}