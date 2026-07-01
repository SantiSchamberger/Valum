'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Users, Check, X, Download } from 'lucide-react'
import Link from 'next/link'

interface ClientRelation {
  id: string
  status: 'pending' | 'active' | 'rejected'
  client: {
    id: string
    email: string
    full_name: string
    role: string
  }
}

interface ClientsClientProps {
  initialRelations: ClientRelation[] | null
}

export default function ClientsClient({ initialRelations }: ClientsClientProps) {
  const supabase = createClient()
  const [relations, setRelations] = useState<ClientRelation[]>(initialRelations || [])
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleApprove = async (relationId: string) => {
    setIsLoading(relationId)
    try {
      const { error } = await supabase
        .from('advisor_clients')
        .update({ status: 'active' })
        .eq('id', relationId)

      if (error) throw error

      setRelations(relations.map(r => 
        r.id === relationId ? { ...r, status: 'active' } : r
      ))
    } catch (error) {
      console.error('Error approving client:', error)
      alert('Error al aceptar al cliente')
    } finally {
      setIsLoading(null)
    }
  }

  const handleReject = async (relationId: string) => {
    setIsLoading(relationId)
    try {
      const { error } = await supabase
        .from('advisor_clients')
        .update({ status: 'rejected' })
        .eq('id', relationId)

      if (error) throw error

      setRelations(relations.map(r => 
        r.id === relationId ? { ...r, status: 'rejected' } : r
      ))
    } catch (error) {
      console.error('Error rejecting client:', error)
      alert('Error al rechazar al cliente')
    } finally {
      setIsLoading(null)
    }
  }

  const handleDownload = async (clientId: string, clientName: string) => {
    try {
      const response = await fetch(`/api/advisor-client-data?client_id=${clientId}&format=csv`)
      if (!response.ok) throw new Error('Error downloading data')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resumen-${clientName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading:', error)
      alert('Error al descargar los datos')
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
            <h1 className="text-2xl font-bold text-foreground">Mis Clientes</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {(!relations || relations.length === 0) ? (
            <Card className="border-0 shadow-md">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="flex justify-center mb-4">
                  <Users className="w-12 h-12 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">
                  No tienes clientes asociados aún
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Los clientes podrán solicitar conectarse contigo
                </p>
                <Button disabled>
                  Invitar Cliente
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Pending Requests */}
              {relations.filter(r => r.status === 'pending').length > 0 && (
                <>
                  <div>
                    <h2 className="text-lg font-bold text-foreground mb-4">Solicitudes Pendientes</h2>
                    <div className="grid gap-4">
                      {relations.filter(r => r.status === 'pending').map((relation) => (
                        <Card key={relation.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base">{relation.client.full_name}</CardTitle>
                                <CardDescription>{relation.client.email}</CardDescription>
                              </div>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                Pendiente
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex gap-3">
                              <Button
                                onClick={() => handleApprove(relation.id)}
                                disabled={isLoading === relation.id}
                                className="gap-2"
                                size="sm"
                              >
                                <Check className="w-4 h-4" />
                                Aceptar
                              </Button>
                              <Button
                                onClick={() => handleReject(relation.id)}
                                disabled={isLoading === relation.id}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                              >
                                <X className="w-4 h-4" />
                                Rechazar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Active Clients */}
              {relations.filter(r => r.status === 'active').length > 0 && (
                <>
                  <div>
                    <h2 className="text-lg font-bold text-foreground mb-4">Clientes Activos</h2>
                    <div className="grid gap-4">
                      {relations.filter(r => r.status === 'active').map((relation) => (
                        <Card key={relation.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base">{relation.client.full_name}</CardTitle>
                                <CardDescription>{relation.client.email}</CardDescription>
                              </div>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                Activo
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-3">
                              <Button
                                onClick={() => handleDownload(relation.client.id, relation.client.full_name)}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                              >
                                <Download className="w-4 h-4" />
                                Descargar CSV
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Rejected Clients */}
              {relations.filter(r => r.status === 'rejected').length > 0 && (
                <>
                  <div>
                    <h2 className="text-lg font-bold text-foreground mb-4">Solicitudes Rechazadas</h2>
                    <div className="grid gap-4">
                      {relations.filter(r => r.status === 'rejected').map((relation) => (
                        <Card key={relation.id} className="border-0 shadow-sm opacity-75">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base text-muted-foreground">{relation.client.full_name}</CardTitle>
                                <CardDescription>{relation.client.email}</CardDescription>
                              </div>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                                Rechazado
                              </span>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
