'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, Users, Mail, Phone, UserCheck, Star, Plus } from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface Advisor {
  id: string
  email: string
  full_name: string
  phone?: string
  created_at: string
  role: string
}

interface AdvisorRelation {
  id: string
  status: string
  advisor: any
}

interface AdvisorsClientProps {
  role: string
  advisorRelations?: AdvisorRelation[] | null
  allAdvisors?: Advisor[] | null
  userId: string
}

export default function AdvisorsClient({
  role,
  advisorRelations,
  allAdvisors,
  userId,
}: AdvisorsClientProps) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentRelations, setCurrentRelations] = useState(advisorRelations || [])

  const isAdminOrAdvisor = role === 'admin' || role === 'advisor'

  const handleSelectAdvisor = async (advisor: Advisor) => {
    setIsLoading(true)
    try {
      // Check if relationship already exists
      const existing = currentRelations?.find(r => r.advisor.id === advisor.id)
      if (existing) {
        alert('Ya tienes una solicitud con este asesor')
        setIsLoading(false)
        return
      }

      // Create new advisor_clients relationship
      const { data, error } = await supabase
        .from('advisor_clients')
        .insert({
          advisor_id: advisor.id,
          client_id: userId,
          status: 'pending',
        })
        .select()

      if (error) throw error

      // Refresh the list
      const { data: updated } = await supabase
        .from('advisor_clients')
        .select(`
          *,
          advisor:advisor_id(id, email, full_name, role, phone)
        `)
        .eq('client_id', userId)
        .order('requested_at', { ascending: false })

      setCurrentRelations(updated || [])
      setDialogOpen(false)
      setSelectedAdvisor(null)
      alert('Solicitud enviada al asesor. Espera su respuesta.')
    } catch (error) {
      console.error('Error selecting advisor:', error)
      alert('Error al enviar la solicitud')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 py-4 sm:h-16 sm:py-0">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Volver
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground">
                {isAdminOrAdvisor ? 'Asesores Financieros' : 'Mis Asesores Financieros'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin/Advisor: Full list of all advisors */}
        {isAdminOrAdvisor && (
          <>
            {/* Summary Card */}
            <Card className="border-0 shadow-md mb-6">
              <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-t-lg" />
              <CardHeader className="pt-5">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  Total de asesores registrados
                </CardTitle>
                <CardDescription>
                  {allAdvisors ? allAdvisors.length : 0} asesor{allAdvisors?.length !== 1 ? 'es' : ''} en la plataforma
                </CardDescription>
              </CardHeader>
            </Card>

            {(!allAdvisors || allAdvisors.length === 0) ? (
              <Card className="border-0 shadow-md">
                <CardContent className="pt-16 pb-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-foreground mb-2">No hay asesores registrados</p>
                  <p className="text-sm text-muted-foreground">
                    Cuando un usuario sea asignado como asesor financiero, aparecerá aquí
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <Card className="border-0 shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/30">
                            <th className="text-left py-3.5 px-5 font-semibold text-foreground">Nombre</th>
                            <th className="text-left py-3.5 px-5 font-semibold text-foreground">Correo</th>
                            <th className="text-left py-3.5 px-5 font-semibold text-foreground">Teléfono</th>
                            <th className="text-left py-3.5 px-5 font-semibold text-foreground">Miembro desde</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allAdvisors!.map((advisor, idx) => (
                            <tr
                              key={advisor.id}
                              className={`border-b border-border transition-colors hover:bg-muted/30 ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}
                            >
                              <td className="py-4 px-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                                    {(advisor.full_name || advisor.email || '?')[0].toUpperCase()}
                                  </div>
                                  <p className="font-semibold text-foreground">
                                    {advisor.full_name || '—'}
                                  </p>
                                </div>
                              </td>
                              <td className="py-4 px-5">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                  <Mail className="w-3.5 h-3.5 shrink-0" />
                                  {advisor.email}
                                </span>
                              </td>
                              <td className="py-4 px-5 text-muted-foreground">
                                {advisor.phone ? (
                                  <span className="flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5 shrink-0" />
                                    {advisor.phone}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground/50">No registrado</span>
                                )}
                              </td>
                              <td className="py-4 px-5 text-muted-foreground">
                                {new Date(advisor.created_at).toLocaleDateString('es-AR')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>

                {/* Mobile Cards */}
                <div className="grid gap-4 md:hidden">
                  {allAdvisors!.map((advisor) => (
                    <Card key={advisor.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="py-4 px-5">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                            {(advisor.full_name || advisor.email || '?')[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-foreground text-base">
                              {advisor.full_name || '—'}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Mail className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{advisor.email}</span>
                            </p>
                            {advisor.phone && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Phone className="w-3.5 h-3.5 shrink-0" />
                                {advisor.phone}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Asesor desde {new Date(advisor.created_at).toLocaleDateString('es-AR')}
                            </p>
                          </div>
                          <div className="shrink-0">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                              <Star className="w-3 h-3" />
                              Asesor
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Client: their own advisor relationships and selector */}
        {role === 'client' && (
          <>
            {/* Add Advisor Section */}
            <div className="mb-8">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 shadow-sm" size="lg">
                    <Plus className="w-4 h-4" />
                    Seleccionar un Asesor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Seleccionar Asesor Financiero</DialogTitle>
                    <DialogDescription>
                      Elige un asesor financiero para que te asista. Una vez que acepte tu solicitud, podrá ver tu información financiera.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 max-h-96 overflow-y-auto">
                    {!allAdvisors || allAdvisors.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No hay asesores disponibles
                      </div>
                    ) : (
                      allAdvisors.map((advisor) => {
                        const isAlreadySelected = currentRelations?.some(
                          r => r.advisor.id === advisor.id
                        )
                        return (
                          <Card
                            key={advisor.id}
                            className={`border cursor-pointer transition-all ${
                              isAlreadySelected
                                ? 'border-muted bg-muted/30 opacity-60'
                                : 'border-border hover:border-primary hover:shadow-md'
                            }`}
                          >
                            <CardContent className="py-4 px-5">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                                    {(advisor.full_name || advisor.email || '?')[0].toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-foreground">{advisor.full_name || '—'}</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                                      <Mail className="w-3.5 h-3.5 shrink-0" />
                                      <span className="truncate">{advisor.email}</span>
                                    </p>
                                    {advisor.phone && (
                                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <Phone className="w-3.5 h-3.5 shrink-0" />
                                        {advisor.phone}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  onClick={() => handleSelectAdvisor(advisor)}
                                  disabled={isAlreadySelected || isLoading}
                                  size="sm"
                                  variant={isAlreadySelected ? 'outline' : 'default'}
                                  className="shrink-0"
                                >
                                  {isAlreadySelected ? 'Solicitado' : 'Seleccionar'}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Current Advisors */}
            <div className="grid gap-4">
              <h2 className="text-lg font-bold text-foreground">Mis Asesores Financieros</h2>
              {(!currentRelations || currentRelations.length === 0) ? (
                <Card className="border-0 shadow-md">
                  <CardContent className="pt-16 pb-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-foreground mb-2">
                      Aún no tenés asesores financieros asociados
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      Selecciona un asesor para que te ayude con tus finanzas
                    </p>
                  </CardContent>
                </Card>
              ) : (
                currentRelations.map((relation: any) => (
                  <Card key={relation.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="py-4 px-5">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                          {(relation.advisor.full_name || relation.advisor.email || '?')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground">{relation.advisor.full_name || '—'}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            {relation.advisor.email}
                          </p>
                          {relation.advisor.phone && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Phone className="w-3.5 h-3.5 shrink-0" />
                              {relation.advisor.phone}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            relation.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : relation.status === 'pending'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                          }`}>
                            {relation.status === 'pending' ? 'Pendiente' : 
                             relation.status === 'active' ? 'Activo' : 'Rechazado'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
