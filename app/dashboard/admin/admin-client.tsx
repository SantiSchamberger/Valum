'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LogOut, ArrowLeft, Edit2, ShieldCheck, History, Users, CheckCircle2, XCircle } from 'lucide-react'
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

interface AuditEntry {
  timestamp: string
  adminEmail: string
  targetName: string
  targetEmail: string
  oldRole: string
  newRole: string
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

export default function AdminClient({ 
  profiles: initialProfiles,
  currentUser,
}: { 
  profiles: Profile[]
  currentUser: Profile
}) {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pendingRole, setPendingRole] = useState<string>('')
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const startEditing = (profile: Profile) => {
    setEditingId(profile.id)
    setPendingRole(profile.role)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setPendingRole('')
  }

  const handleRoleChange = async (targetProfile: Profile) => {
    if (!pendingRole || pendingRole === targetProfile.role) {
      cancelEditing()
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: pendingRole })
        .eq('id', targetProfile.id)

      if (updateError) throw updateError

      // Update local state
      setProfiles(prev =>
        prev.map(p => p.id === targetProfile.id ? { ...p, role: pendingRole as Profile['role'] } : p)
      )

      // Add to audit log
      const entry: AuditEntry = {
        timestamp: new Date().toLocaleString('es-AR'),
        adminEmail: currentUser.email,
        targetName: targetProfile.full_name || targetProfile.email,
        targetEmail: targetProfile.email,
        oldRole: targetProfile.role,
        newRole: pendingRole,
      }
      setAuditLog(prev => [entry, ...prev])

      showNotification('success', `Rol de ${targetProfile.full_name || targetProfile.email} cambiado a ${roleLabels[pendingRole]}`)
      cancelEditing()
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Error al actualizar el rol')
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
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{currentUser.full_name || currentUser.email}</p>
                <p className="text-xs text-purple-600 font-medium">Administrador</p>
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
        </div>
      </header>

      {/* Notification toast */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border transition-all ${
          notification.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/40 dark:border-green-700 dark:text-green-200'
            : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/40 dark:border-red-700 dark:text-red-200'
        }`}>
          {notification.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <XCircle className="w-4 h-4 shrink-0" />}
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Resumen de Usuarios
              </CardTitle>
              <CardDescription>Total de usuarios registrados en la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Clientes</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {profiles.filter(p => p.role === 'client').length}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Asesores Financieros</p>
                  <p className="text-3xl font-bold text-green-600">
                    {profiles.filter(p => p.role === 'advisor').length}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Administradores</p>
                  <p className="text-3xl font-bold text-purple-600">
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
              <CardDescription>Hacé clic en "Editar" para cambiar el rol de un usuario. Los cambios se aplican de inmediato.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Usuario</th>
                      <th className="text-left py-3 px-4 font-semibold">Rol actual</th>
                      <th className="text-left py-3 px-4 font-semibold">Miembro desde</th>
                      <th className="text-center py-3 px-4 font-semibold">Cambiar rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((profile) => (
                      <tr key={profile.id} className={`border-b border-border transition-colors ${editingId === profile.id ? 'bg-muted/70' : 'hover:bg-muted/30'}`}>
                        <td className="py-4 px-4">
                          <p className="font-medium text-foreground">{profile.full_name || '—'}</p>
                          <p className="text-xs text-muted-foreground">{profile.email}</p>
                          {profile.id === currentUser.id && (
                            <span className="text-xs text-purple-600 font-medium">(Tú)</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={roleColors[profile.role]}>
                            {roleLabels[profile.role]}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {new Date(profile.created_at).toLocaleDateString('es-AR')}
                        </td>
                        <td className="py-4 px-4">
                          {editingId === profile.id ? (
                            <div className="flex items-center gap-2 justify-center flex-wrap">
                              <div className="w-48">
                                <Label htmlFor={`role-${profile.id}`} className="sr-only">Nuevo rol</Label>
                                <Select
                                  value={pendingRole}
                                  onValueChange={(value) => { if (value) setPendingRole(value) }}
                                >
                                  <SelectTrigger id={`role-${profile.id}`} className="h-9">
                                    <SelectValue>
                                      {roleLabels[pendingRole]}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="client">Cliente</SelectItem>
                                    <SelectItem value="advisor">Asesor Financiero</SelectItem>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleRoleChange(profile)}
                                disabled={isLoading || pendingRole === profile.role}
                              >
                                {isLoading ? 'Guardando...' : 'Confirmar'}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={cancelEditing}
                                disabled={isLoading}
                              >
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startEditing(profile)}
                                className="cursor-pointer"
                              >
                                <Edit2 className="w-4 h-4 mr-1" />
                                Editar
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Audit Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Auditoría de Cambios
              </CardTitle>
              <CardDescription>Historial de cambios de roles realizados en esta sesión</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLog.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No hay cambios registrados en esta sesión.</p>
                  <p className="text-xs mt-1">Los cambios de roles que realices aparecerán aquí.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold">Fecha y hora</th>
                        <th className="text-left py-3 px-4 font-semibold">Usuario afectado</th>
                        <th className="text-left py-3 px-4 font-semibold">Rol anterior</th>
                        <th className="text-left py-3 px-4 font-semibold">Nuevo rol</th>
                        <th className="text-left py-3 px-4 font-semibold">Realizado por</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLog.map((entry, idx) => (
                        <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">{entry.timestamp}</td>
                          <td className="py-3 px-4">
                            <p className="font-medium">{entry.targetName}</p>
                            <p className="text-xs text-muted-foreground">{entry.targetEmail}</p>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={roleColors[entry.oldRole]}>
                              {roleLabels[entry.oldRole]}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={roleColors[entry.newRole]}>
                              {roleLabels[entry.newRole]}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{entry.adminEmail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
