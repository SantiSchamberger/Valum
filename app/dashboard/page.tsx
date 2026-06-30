import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/auth/login')
  }

  // Get user profile - retry if not found (may still be creating)
  let profile = null
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  profile = profileData

  // If profile doesn't exist yet, create a basic one
  if (!profile) {
    const newProfile = {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || '',
      role: user.user_metadata?.role || 'client',
      phone: null,
      avatar_url: null,
    }
    
    const { data: createdProfile } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select('*')
      .single()

    profile = createdProfile
  }

  if (!profile) {
    redirect('/auth/login')
  }

  return <DashboardClient user={user} profile={profile} />
}
