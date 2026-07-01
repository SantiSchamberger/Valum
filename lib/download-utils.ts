export function generateCSV(transactions: any[], balance: any, clientName: string) {
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

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function downloadJSON(data: any, filename: string) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
