import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'

export default async function AdvisorsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Only clients can view this
  if (profile?.role !== 'client') {
    redirect('/dashboard')
  }

  // Get advisor relationships
  const { data: advisorRelations } = await supabase
    .from('advisor_clients')
    .select(`
      *,
      advisor:advisor_id(id, email, full_name, role)
    `)
    .eq('client_id', user.id)
    .order('requested_at', { ascending: false })

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
            <h1 className="text-2xl font-bold text-foreground">Mis Asesores Financieros</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {(!advisorRelations || advisorRelations.length === 0) ? (
            <Card className="border-2">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="flex justify-center mb-4">
                  <Users className="w-12 h-12 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Aún no tienes asesores financieros asociados
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Esta sección está disponible en la próxima versión
                </p>
                <Button disabled>
                  Solicitar Asesor
                </Button>
              </CardContent>
            </Card>
          ) : (
            advisorRelations?.map((relation: any) => (
              <Card key={relation.id} className="border-2">
                <CardHeader>
                  <CardTitle>{relation.advisor.full_name}</CardTitle>
                  <CardDescription>{relation.advisor.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium mb-2">Estado:</p>
                      <p className={`text-sm font-medium capitalize ${
                        relation.status === 'active' ? 'text-green-600' :
                        relation.status === 'pending' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {relation.status === 'pending' ? 'Pendiente' : 
                         relation.status === 'active' ? 'Activo' : 'Rechazado'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
