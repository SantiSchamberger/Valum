import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientsClient from './clients-client'

export default async function ClientsPage() {
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

  // Only advisors and admins can view this
  if (profile?.role !== 'advisor' && profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get client relationships
  const { data: clientRelations } = await supabase
    .from('advisor_clients')
    .select(`
      *,
      client:client_id(id, email, full_name, role)
    `)
    .eq('advisor_id', user.id)
    .order('requested_at', { ascending: false })

  return <ClientsClient initialRelations={clientRelations} />
}
