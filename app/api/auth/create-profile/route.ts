import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { message: 'Profile already exists', profile: existingProfile },
        { status: 200 }
      )
    }

    // Create profile
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || '',
        role: 'client',
      })
      .select()
      .single()

    if (profileError) {
      console.error('[API] Profile creation error:', profileError)
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      )
    }

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

    const { error: categoriesError } = await supabase
      .from('categories')
      .insert(defaultCategories)

    if (categoriesError) {
      console.error('[API] Error inserting default categories:', categoriesError)
    }

    return NextResponse.json(
      { message: 'Profile created successfully', profile: newProfile },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API] Create profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
