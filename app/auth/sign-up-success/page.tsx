'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="border-2">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold">¡Registro exitoso!</CardTitle>
              <CardDescription>
                Tu cuenta ha sido creada correctamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Hemos enviado un enlace de confirmación a tu correo electrónico. 
                  Por favor, revisa tu bandeja de entrada y confirma tu email.
                </p>
                <p className="font-medium text-foreground">
                  Una vez confirmado, podrás acceder a tu plataforma con tus credenciales.
                </p>
              </div>
              
              <div className="space-y-3">
                <Link href="/auth/login" className="block">
                  <Button className="w-full" size="lg">
                    Ir al inicio de sesión
                  </Button>
                </Link>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  ¿No recibiste el email? Revisa tu carpeta de spam o intenta registrarte nuevamente.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
