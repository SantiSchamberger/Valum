import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'

// Disable caching for this page so middleware always runs
export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.log('[Dashboard] No session or error. User:', user?.id, 'Error:', userError?.message || userError)
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
    
    const { data: createdProfile, error: insertError } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select('*')
      .single()

    if (insertError) {
      console.error('[Dashboard] Fallback profile creation error:', insertError)
    } else if (createdProfile) {
      // Crear categorías por defecto para el nuevo usuario (Ingresos y Gastos)
      const defaultCategories = [
        // Ingresos
        { user_id: user.id, name: 'Sueldo / Salario', color: '#10B981', icon: 'tag' },
        { user_id: user.id, name: 'Ingresos Extra / Freelance', color: '#34D399', icon: 'tag' },
        { user_id: user.id, name: 'Inversiones / Dividendos', color: '#059669', icon: 'tag' },
        
        // Gastos Fijos
        { user_id: user.id, name: 'Vivienda / Alquiler', color: '#F59E0B', icon: 'tag' },
        { user_id: user.id, name: 'Servicios (Luz, Gas, Internet)', color: '#D97706', icon: 'tag' },
        { user_id: user.id, name: 'Transporte / Seguro', color: '#3B82F6', icon: 'tag' },
        
        // Gastos Variables
        { user_id: user.id, name: 'Alimentación / Supermercado', color: '#22C55E', icon: 'tag' },
        { user_id: user.id, name: 'Ocio / Entretenimiento', color: '#EF4444', icon: 'tag' },
        { user_id: user.id, name: 'Salud / Farmacia', color: '#8B5CF6', icon: 'tag' },
        { user_id: user.id, name: 'Suscripciones Digitales', color: '#EC4899', icon: 'tag' },
        { user_id: user.id, name: 'Otros', color: '#14B8A6', icon: 'tag' },
      ]
      await supabase.from('categories').insert(defaultCategories)
    }

    profile = createdProfile
  }

  if (!profile) {
    redirect('/auth/login')
  }

  return <DashboardClient user={user} profile={profile} />
}
