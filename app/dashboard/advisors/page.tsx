import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdvisorsClient from './advisors-client'

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

  const role = profile?.role

  // Only clients, advisors, and admins can view this
  if (!role || (role !== 'client' && role !== 'advisor' && role !== 'admin')) {
    redirect('/dashboard')
  }

  // If client: fetch their advisor relationships
  let advisorRelations: any[] | null = null
  // If admin or advisor: fetch all advisors
  let allAdvisors: any[] | null = null

  if (role === 'client') {
    const { data } = await supabase
      .from('advisor_clients')
      .select(`
        *,
        advisor:advisor_id(id, email, full_name, role, phone)
      `)
      .eq('client_id', user.id)
      .order('requested_at', { ascending: false })
    advisorRelations = data
  } else {
    // Admin or advisor: list all advisors and admin from profiles table
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, created_at, role')
      .in('role', ['advisor', 'admin'])
      .order('full_name', { ascending: true })
    allAdvisors = data
  }

  return (
    <AdvisorsClient
      role={role}
      advisorRelations={advisorRelations}
      allAdvisors={allAdvisors}
      userId={user.id}
    />
  )
}
