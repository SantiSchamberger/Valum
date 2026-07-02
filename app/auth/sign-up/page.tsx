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
import { useEffect, useState } from 'react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [referrer, setReferrer] = useState<string | null>(null)
  const [referrerName, setReferrerName] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    setReferrer(params.get('referrer'))
    setReferrerName(params.get('referrer_name'))
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (authError) {
        const errorMessage = authError.message || JSON.stringify(authError)
        console.log('[SignUp] Auth error:', errorMessage)
        throw new Error(errorMessage)
      }

      if (!authData?.user) {
        throw new Error('No se pudo crear la cuenta')
      }

      console.log('[SignUp] User created:', authData.user.id)

      await new Promise(resolve => setTimeout(resolve, 1000))

      try {
        const profileResponse = await fetch('/api/auth/create-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referrer: referrer || null,
            referrer_name: referrerName || null,
          }),
        })

        if (!profileResponse.ok) {
          console.log('[SignUp] Profile creation failed:', profileResponse.status)
        } else {
          console.log('[SignUp] Profile created successfully')
        }
      } catch (profileError) {
        console.log('[SignUp] Profile creation error:', profileError)
      }

      await new Promise(resolve => setTimeout(resolve, 500))

      console.log('[SignUp] Redirecting to dashboard')
      window.location.href = '/dashboard'
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error al registrarse'
      console.log('[SignUp] Exception:', errorMessage)
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
              <CardTitle className="text-3xl font-bold tracking-tight">Crea tu cuenta</CardTitle>
              <CardDescription className="font-light">
                Únete a Valum y comienza a gestionar tus finanzas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName" className="font-medium">Nombre completo</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Tu nombre"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
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
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword" className="font-medium">Confirmar contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                    {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                  </Button>
                </div>
                <div className="mt-6 text-center text-sm text-muted-foreground font-light">
                  ¿Ya tienes cuenta?{' '}
                  <Link
                    href="/auth/login"
                    className="font-medium text-primary hover:underline"
                  >
                    Inicia sesión
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