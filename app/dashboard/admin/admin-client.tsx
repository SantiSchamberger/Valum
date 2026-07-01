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
import { LogOut, ArrowLeft, Edit2, ShieldCheck, History, Users, CheckCircle2, XCircle, X } from 'lucide-react'
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
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
  advisor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  client: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
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

      setProfiles(prev =>
        prev.map(p => p.id === targetProfile.id ? { ...p, role: pendingRole as Profile['role'] } : p)
      )

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

  const clientCount = profiles.filter(p => p.role === 'client').length
  const advisorCount = profiles.filter(p => p.role === 'advisor').length
  const adminCount = profiles.filter(p => p.role === 'admin').length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center gap-3 py-4 sm:h-16 sm:py-0">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Volver
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">Panel de Administración</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{currentUser.full_name || currentUser.email}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Administrador</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                <span className="hidden xs:inline">Cerrar sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification toast */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border max-w-sm ${
          notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-700 dark:text-emerald-200'
            : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/40 dark:border-rose-700 dark:text-rose-200'
        }`}>
          {notification.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <XCircle className="w-4 h-4 shrink-0" />}
          <p className="text-sm font-medium flex-1">{notification.message}</p>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-5">
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 bg-blue-500 rounded-t-lg" />
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-xs text-muted-foreground mb-1 font-medium">Clientes</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{clientCount}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 bg-emerald-500 rounded-t-lg" />
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-xs text-muted-foreground mb-1 font-medium">Asesores</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{advisorCount}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 bg-purple-500 rounded-t-lg" />
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-xs text-muted-foreground mb-1 font-medium">Admins</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{adminCount}</p>
              </CardContent>
            </Card>
          </div>

          {/* Users Management */}
          <Card className="border-0 shadow-md">
            <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-t-lg" />
            <CardHeader className="pt-5">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Users className="w-5 h-5 text-purple-600" />
                Gestión de Usuarios
              </CardTitle>
              <CardDescription>
                Hacé clic en "Editar" para cambiar el rol de un usuario. Los cambios se aplican de inmediato.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3.5 px-4 font-semibold">Usuario</th>
                      <th className="text-left py-3.5 px-4 font-semibold">Rol actual</th>
                      <th className="text-left py-3.5 px-4 font-semibold">Miembro desde</th>
                      <th className="text-center py-3.5 px-4 font-semibold">Cambiar rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((profile, idx) => (
                      <tr key={profile.id} className={`border-b border-border transition-colors ${editingId === profile.id ? 'bg-muted/60' : idx % 2 === 0 ? '' : 'bg-muted/10'} hover:bg-muted/30`}>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${
                              profile.role === 'admin' ? 'bg-purple-500' : profile.role === 'advisor' ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}>
                              {(profile.full_name || profile.email || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{profile.full_name || '—'}</p>
                              <p className="text-xs text-muted-foreground">{profile.email}</p>
                              {profile.id === currentUser.id && (
                                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">(Tú)</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={roleColors[profile.role]}>
                            {roleLabels[profile.role]}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground text-sm">
                          {new Date(profile.created_at).toLocaleDateString('es-AR')}
                        </td>
                        <td className="py-4 px-4">
                          {editingId === profile.id ? (
                            <div className="flex items-center gap-2 justify-center flex-wrap">
                              <div className="w-44">
                                <Label htmlFor={`role-${profile.id}`} className="sr-only">Nuevo rol</Label>
                                <Select
                                  value={pendingRole}
                                  onValueChange={(value) => { if (value) setPendingRole(value) }}
                                >
                                  <SelectTrigger id={`role-${profile.id}`} className="h-9 w-full">
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
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startEditing(profile)}
                              >
                                <Edit2 className="w-3.5 h-3.5 mr-1" />
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

              {/* Mobile Cards */}
              <div className="grid gap-3 md:hidden">
                {profiles.map((profile) => (
                  <div key={profile.id} className={`rounded-xl border border-border p-4 transition-colors ${editingId === profile.id ? 'bg-muted/60' : 'bg-card hover:bg-muted/20'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                        profile.role === 'admin' ? 'bg-purple-500' : profile.role === 'advisor' ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}>
                        {(profile.full_name || profile.email || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="font-semibold text-foreground">{profile.full_name || '—'}</p>
                            <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                            {profile.id === currentUser.id && (
                              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">(Tú)</span>
                            )}
                          </div>
                          <Badge className={roleColors[profile.role]}>
                            {roleLabels[profile.role]}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Desde {new Date(profile.created_at).toLocaleDateString('es-AR')}
                        </p>
                        {editingId === profile.id ? (
                          <div className="mt-3 flex flex-col gap-2">
                            <Select
                              value={pendingRole}
                              onValueChange={(value) => { if (value) setPendingRole(value) }}
                            >
                              <SelectTrigger className="h-9 w-full">
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
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1"
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
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditing(profile)}
                            className="mt-3 w-full"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                            Editar rol
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Audit Log */}
          <Card className="border-0 shadow-md">
            <div className="h-1 w-full bg-gradient-to-r from-slate-400 to-slate-600 rounded-t-lg" />
            <CardHeader className="pt-5">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <History className="w-5 h-5 text-muted-foreground" />
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
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left py-3.5 px-4 font-semibold">Fecha y hora</th>
                          <th className="text-left py-3.5 px-4 font-semibold">Usuario afectado</th>
                          <th className="text-left py-3.5 px-4 font-semibold">Rol anterior</th>
                          <th className="text-left py-3.5 px-4 font-semibold">Nuevo rol</th>
                          <th className="text-left py-3.5 px-4 font-semibold">Realizado por</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLog.map((entry, idx) => (
                          <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4 text-muted-foreground whitespace-nowrap text-xs">{entry.timestamp}</td>
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
                            <td className="py-3 px-4 text-muted-foreground text-xs">{entry.adminEmail}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="grid gap-3 md:hidden">
                    {auditLog.map((entry, idx) => (
                      <div key={idx} className="rounded-xl border border-border p-4 bg-muted/20">
                        <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
                          <div>
                            <p className="font-semibold text-foreground text-sm">{entry.targetName}</p>
                            <p className="text-xs text-muted-foreground">{entry.targetEmail}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{entry.timestamp}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={roleColors[entry.oldRole]}>{roleLabels[entry.oldRole]}</Badge>
                          <span className="text-muted-foreground">→</span>
                          <Badge className={roleColors[entry.newRole]}>{roleLabels[entry.newRole]}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Por: {entry.adminEmail}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  )
}
