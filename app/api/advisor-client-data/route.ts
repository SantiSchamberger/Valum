import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function generateCSV(transactions: any[], balance: any, clientName: string) {
  let csv = `Resumen Financiero - ${clientName}\n`
  csv += `Descargado: ${new Date().toLocaleString('es-AR')}\n\n`

  // Balance summary
  csv += `RESUMEN\n`
  csv += `Ingresos,${balance.income.toFixed(2)}\n`
  csv += `Gastos,${balance.expenses.toFixed(2)}\n`
  csv += `Balance Neto,${balance.net.toFixed(2)}\n\n`

  // Transactions
  csv += `TRANSACCIONES\n`
  csv += `Fecha,Descripción,Tipo,Monto,Moneda\n`
  
  transactions.forEach((tx: any) => {
    const fecha = new Date(tx.date).toLocaleDateString('es-AR')
    const descripcion = (tx.description || '').replace(/,/g, ';')
    const tipo = tx.type === 'income' ? 'Ingreso' : 'Gasto'
    csv += `${fecha},"${descripcion}",${tipo},${tx.amount.toFixed(2)},${tx.currency}\n`
  })

  return csv
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's profile and role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single()

    // Only advisors and admins can access this
    if (profile?.role !== 'advisor' && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const clientId = request.nextUrl.searchParams.get('client_id')
    const format = request.nextUrl.searchParams.get('format') || 'json'

    if (!clientId) {
      return NextResponse.json({ error: 'Missing client_id' }, { status: 400 })
    }

    // Verify that the advisor/admin has access to this client
    const { data: relationship } = await supabase
      .from('advisor_clients')
      .select('status')
      .eq('advisor_id', user.id)
      .eq('client_id', clientId)
      .eq('status', 'active')
      .single()

    if (!relationship && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'No access to this client' }, { status: 403 })
    }

    // Get client info
    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', clientId)
      .single()

    // Get client transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', clientId)
      .order('date', { ascending: false })

    // Get categories
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', clientId)

    // Calculate balance
    let income = 0
    let expenses = 0
    
    transactions?.forEach(tx => {
      if (tx.type === 'income') {
        income += tx.amount
      } else {
        expenses += tx.amount
      }
    })

    const balance = {
      income,
      expenses,
      net: income - expenses
    }

    if (format === 'csv') {
      const csv = generateCSV(transactions || [], balance, clientProfile?.full_name || 'Cliente')
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="resumen-${(clientProfile?.full_name || 'cliente').toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    // Default: JSON format
    return NextResponse.json({
      transactions,
      categories,
      balance,
      clientName: clientProfile?.full_name
    })
  } catch (error) {
    console.error('Error in advisor-client-data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
