'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SettingsClientProps {
  user: any
  profile: any
}

export default function SettingsClient({ user, profile }: SettingsClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
  })

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
        })
        .eq('id', user.id)

      if (error) throw error

      alert('Perfil actualizado exitosamente')
      router.refresh()
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error al actualizar el perfil')
    } finally {
      setIsLoading(false)
    }
  }

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
            <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Section */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Mi Perfil</CardTitle>
              <CardDescription>
                Actualiza tu información personal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">No se puede cambiar el correo</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="fullName">Nombre completo</Label>
                  <Input
                    id="fullName"
                    placeholder="Tu nombre"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+34 123 456 789"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Tipo de cuenta</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-foreground capitalize">
                      {profile?.role === 'advisor' ? 'Asesor Financiero' : profile?.role === 'admin' ? 'Administrador' : 'Cliente'}
                    </p>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full gap-2">
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>
                Administra tu seguridad y contraseña
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-foreground mb-2">Cambiar contraseña</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Para cambiar tu contraseña, verifica tu identidad a través de tu correo electrónico.
                </p>
                <Button variant="outline">
                  Cambiar contraseña
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Información de la cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID del usuario:</span>
                <code className="bg-muted px-2 py-1 rounded text-xs font-mono">{user.id}</code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cuenta creada:</span>
                <span>{new Date(user.created_at).toLocaleDateString('es-ES')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Última conexión:</span>
                <span>{new Date(user.last_sign_in_at).toLocaleDateString('es-ES')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
