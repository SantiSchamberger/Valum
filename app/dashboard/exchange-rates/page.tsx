import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ExchangeRateClient from './exchange-rate-client'

export default async function ExchangeRatePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get exchange rate history (últimos 30 días)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: exchangeRates } = await supabase
    .from('exchange_rates')
    .select('*')
    .eq('currency_from', 'USD')
    .eq('currency_to', 'ARS')
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: true })

  return (
    <ExchangeRateClient exchangeRates={exchangeRates || []} />
  )
}
