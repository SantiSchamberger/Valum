'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { LogOut, ArrowLeft, Edit2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Profile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'advisor' | 'client'
  phone: string | null
  created_at: string
}

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  advisor: 'Asesor Financiero',
  client: 'Cliente',
}

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  advisor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  client: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
}

export default function AdminClient({ profiles }: { profiles: Profile[] }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [newRole, setNewRole] = useState<'admin' | 'advisor' | 'client'>('client')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleRoleChange = async () => {
    if (!selectedUser) return
    
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', selectedUser.id)

      if (updateError) throw updateError

      setSuccess(`Rol de ${selectedUser.full_name} actualizado a ${roleLabels[newRole]}`)
      setSelectedUser(null)
      
      // Refresh page
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el rol')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="cursor-pointer">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Usuarios</CardTitle>
              <CardDescription>Total de usuarios registrados en la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Clientes</p>
                  <p className="text-2xl font-bold text-foreground">
                    {profiles.filter(p => p.role === 'client').length}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Asesores</p>
                  <p className="text-2xl font-bold text-foreground">
                    {profiles.filter(p => p.role === 'advisor').length}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Administradores</p>
                  <p className="text-2xl font-bold text-foreground">
                    {profiles.filter(p => p.role === 'admin').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>Modifica roles y información de usuarios</CardDescription>
            </CardHeader>
            <CardContent>
              {success && (
                <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded text-green-800 dark:text-green-200">
                  {success}
                </div>
              )}
              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded text-red-800 dark:text-red-200">
                  {error}
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Email</th>
                      <th className="text-left py-3 px-4 font-semibold">Nombre</th>
                      <th className="text-left py-3 px-4 font-semibold">Rol</th>
                      <th className="text-left py-3 px-4 font-semibold">Teléfono</th>
                      <th className="text-center py-3 px-4 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((profile) => (
                      <tr key={profile.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">{profile.email}</td>
                        <td className="py-3 px-4">{profile.full_name || '-'}</td>
                        <td className="py-3 px-4">
                          <Badge className={roleColors[profile.role]}>
                            {roleLabels[profile.role]}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{profile.phone || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(profile)
                                  setNewRole(profile.role)
                                }}
                                className="cursor-pointer"
                              >
                                <Edit2 className="w-4 h-4 mr-1" />
                                Editar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Cambiar Rol</DialogTitle>
                                <DialogDescription>
                                  Modifica el rol de {profile.full_name || profile.email}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="role-select">Nuevo Rol</Label>
                                  <Select value={newRole} onValueChange={(value: any) => setNewRole(value)}>
                                    <SelectTrigger id="role-select">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="client">Cliente</SelectItem>
                                      <SelectItem value="advisor">Asesor Financiero</SelectItem>
                                      <SelectItem value="admin">Administrador</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setSelectedUser(null)} className="cursor-pointer">
                                  Cancelar
                                </Button>
                                <Button 
                                  onClick={handleRoleChange} 
                                  disabled={isLoading}
                                  className="cursor-pointer"
                                >
                                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
