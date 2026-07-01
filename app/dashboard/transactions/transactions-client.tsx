'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Plus, Trash2, TrendingDown, TrendingUp, DollarSign, Tag, Download, Wallet } from 'lucide-react'
import { generateCSV, downloadCSV } from '@/lib/download-utils'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  date: string
  category_id: string
  currency: string
}

interface TransactionsClientProps {
  user: any
  categories: Category[]
  initialTransactions: Transaction[]
}

export default function TransactionsClient({ 
  user, 
  categories, 
  initialTransactions 
}: TransactionsClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    currency: 'ARS',
  })

  // Obtener el tipo de cambio cuando se selecciona USD
  const handleCurrencyChange = async (currency: string) => {
    setFormData({...formData, currency})
    
    if (currency === 'USD') {
      try {
        const response = await fetch(`/api/get-exchange-rate?date=${formData.date}`)
        const data = await response.json()
        setExchangeRate(data.rate)
      } catch (error) {
        console.error('Error fetching exchange rate:', error)
        setExchangeRate(null)
      }
    }
  }

  // Obtener tipo de cambio cuando cambia la fecha
  const handleDateChange = async (date: string) => {
    setFormData({...formData, date})
    
    if (formData.currency === 'USD') {
      try {
        const response = await fetch(`/api/get-exchange-rate?date=${date}`)
        const data = await response.json()
        setExchangeRate(data.rate)
      } catch (error) {
        console.error('Error fetching exchange rate:', error)
        setExchangeRate(null)
      }
    }
  }

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!formData.amount || !formData.description) {
        alert('Por favor completa todos los campos')
        return
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: formData.type,
          amount: parseFloat(formData.amount),
          description: formData.description,
          date: formData.date,
          category_id: formData.categoryId || null,
          currency: formData.currency,
          exchange_rate: formData.currency === 'USD' ? exchangeRate : null,
        })
        .select()

      if (error) throw error

      setTransactions([data[0], ...transactions])
      setFormData({
        type: 'expense',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        categoryId: '',
        currency: 'ARS',
      })
      setExchangeRate(null)
      setIsAddingNew(false)
    } catch (error) {
      console.error('Error adding transaction:', error)
      alert('Error al agregar transacción')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta transacción?')) return

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', user.id)

      if (error) throw error

      setTransactions(transactions.filter(t => t.id !== transactionId))
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('Error al eliminar transacción')
    }
  }

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null
    const category = categories.find(c => c.id === categoryId)
    return category || null
  }

  const formatAmount = (amount: number, currency: string) => {
    return currency === 'USD'
      ? `US$${amount.toFixed(2)}`
      : `$${amount.toFixed(2)}`
  }

  const handleDownloadCSV = () => {
    // Calculate totals
    let totalIncome = 0
    let totalExpense = 0
    
    transactions.forEach(tx => {
      if (tx.type === 'income') {
        totalIncome += tx.amount
      } else {
        totalExpense += tx.amount
      }
    })

    const csv = generateCSV(transactions, {
      income: totalIncome,
      expenses: totalExpense,
      net: totalIncome - totalExpense
    }, user.email || 'mis-transacciones')

    downloadCSV(csv, `transacciones-${new Date().toISOString().split('T')[0]}.csv`)
  }

  const selectedCategoryName = formData.categoryId
    ? categories.find(c => c.id === formData.categoryId)?.name
    : undefined

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center gap-3 py-4 sm:h-16 sm:py-0">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Volver
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-foreground">Mis Transacciones</h1>
            </div>
            <div className="flex gap-2">
              {transactions.length > 0 && (
                <Button 
                  onClick={handleDownloadCSV}
                  className="gap-2 shadow-sm"
                  size="sm"
                  variant="outline"
                >
                  <Download className="w-4 h-4" />
                  Descargar CSV
                </Button>
              )}
              <Button 
                onClick={() => setIsAddingNew(!isAddingNew)}
                className="gap-2 shadow-sm"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                {isAddingNew ? 'Cancelar' : 'Nueva transacción'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAddingNew && (
          <Card className="border-0 shadow-lg mb-8">
            <div className="h-1 w-full bg-gradient-to-r from-primary to-secondary rounded-t-lg" />
            <CardHeader className="pt-5">
              <CardTitle className="text-lg font-bold">Agregar Nueva Transacción</CardTitle>
              <CardDescription>
                Registrá un ingreso o gasto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddTransaction} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tipo */}
                  <div className="grid gap-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => {
                        if (value === 'income' || value === 'expense') {
                          setFormData({...formData, type: value})
                        }
                      }}
                    >
                      <SelectTrigger id="type" className="w-full h-10">
                        <SelectValue>
                          {formData.type === 'income' ? 'Ingreso' : 'Gasto'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Ingreso</SelectItem>
                        <SelectItem value="expense">Gasto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Moneda */}
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Moneda</Label>
                    <Select 
                      value={formData.currency} 
                      onValueChange={handleCurrencyChange}
                    >
                      <SelectTrigger id="currency" className="w-full h-10">
                        <SelectValue>
                          {formData.currency === 'USD' ? 'Dólares (US$)' : 'Pesos ($)'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ARS">Pesos ($)</SelectItem>
                        <SelectItem value="USD">Dólares (US$)</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.currency === 'USD' && exchangeRate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Tasa: $1 USD = ${exchangeRate.toFixed(2)} ARS
                      </p>
                    )}
                  </div>

                  {/* Monto */}
                  <div className="grid gap-2">
                    <Label htmlFor="amount">
                      Monto {formData.currency === 'USD' ? '(US$)' : '($)'}
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      required
                      className="h-10"
                    />
                  </div>

                  {/* Fecha */}
                  <div className="grid gap-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      required
                      className="h-10"
                    />
                  </div>

                  {/* Categoría */}
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="category">Categoría (opcional)</Label>
                    <Select 
                      value={formData.categoryId} 
                      onValueChange={(value) => value && setFormData({...formData, categoryId: value})}
                    >
                      <SelectTrigger id="category" className="w-full h-10">
                        <SelectValue placeholder="Selecciona una categoría">
                          {selectedCategoryName}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full inline-block shrink-0"
                                style={{ backgroundColor: cat.color }}
                              />
                              {cat.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Descripción */}
                <div className="grid gap-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    placeholder="Ej: Salario mensual, Compra de supermercado..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    className="h-10"
                  />
                </div>

                <Button type="submit" className="w-full shadow-sm" disabled={isLoading} size="lg">
                  {isLoading ? 'Guardando...' : 'Guardar Transacción'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Transactions List */}
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="pt-16 pb-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-2 font-medium">No hay transacciones registradas</p>
                <p className="text-sm text-muted-foreground mb-6">Empezá registrando tu primer ingreso o gasto</p>
                <Button onClick={() => setIsAddingNew(true)} className="shadow-sm">
                  Agregar tu primera transacción
                </Button>
              </CardContent>
            </Card>
          ) : (
            transactions.map(transaction => {
              const cat = getCategoryName(transaction.category_id)
              const isUSD = transaction.currency === 'USD'
              return (
                <Card key={transaction.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="py-4 px-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          transaction.type === 'income' 
                            ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                            : 'bg-rose-100 dark:bg-rose-900/30'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{transaction.description}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {cat ? (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span
                                  className="w-2 h-2 rounded-full inline-block"
                                  style={{ backgroundColor: cat.color }}
                                />
                                {cat.name}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">Sin categoría</span>
                            )}
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">{transaction.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className={`font-bold text-base ${
                            transaction.type === 'income' 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount, transaction.currency || 'ARS')}
                          </p>
                          {isUSD && (
                            <span className="text-xs font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full">
                              USD
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}

// Fix missing Wallet import
function Wallet({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  )
}
