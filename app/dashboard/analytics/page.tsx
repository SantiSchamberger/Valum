import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AnalyticsClient from './analytics-client'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, categories(*)')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  // Get categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)

  return (
    <AnalyticsClient 
      user={user}
      transactions={transactions || []}
      categories={categories || []}
    />
  )
}
