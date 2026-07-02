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
import { ArrowLeft, Plus, Minus, Trash2, Edit2, TrendingDown, TrendingUp, Wallet, Download } from 'lucide-react'
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
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)

  // Form state corregido con soporte explícito para string o null en el ID de la categoría
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '' as string | null,
    currency: 'ARS',
  })

  // Obtener el tipo de cambio cuando se selecciona USD
  const handleCurrencyChange = async (currency: string | null, targetDate = formData.date) => {
    if (!currency) return

    setFormData(prev => ({ ...prev, currency }))

    if (currency === 'USD') {
      try {
        const response = await fetch(`/api/get-exchange-rate?date=${targetDate}`)
        const data = await response.json()
        setExchangeRate(data.rate)
      } catch (error) {
        console.error('Error fetching exchange rate:', error)
        setExchangeRate(null)
      }
    } else {
      setExchangeRate(null)
    }
  }

  // Obtener tipo de cambio cuando cambia la fecha
  const handleDateChange = async (date: string) => {
    setFormData(prev => ({ ...prev, date }))

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

  // Activa el modo edición precargando los datos de forma segura
  const handleStartEdit = async (transaction: Transaction) => {
    setEditingId(transaction.id)
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      date: transaction.date,
      categoryId: transaction.category_id || null,
      currency: transaction.currency || 'ARS',
    })
    setIsFormOpen(true)

    if (transaction.currency === 'USD') {
      await handleCurrencyChange('USD', transaction.date)
    } else {
      setExchangeRate(null)
    }
  }

  const handleCancelForm = () => {
    setIsFormOpen(false)
    setEditingId(null)
    setFormData({
      type: 'expense',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      categoryId: '',
      currency: 'ARS',
    })
    setExchangeRate(null)
  }

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!formData.amount || !formData.description) {
        alert('Por favor completa todos los campos')
        return
      }

      const transactionData = {
        user_id: user.id,
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        category_id: formData.categoryId || null,
        currency: formData.currency,
        exchange_rate: formData.currency === 'USD' ? exchangeRate : null,
      }

      if (editingId) {
        // MODO EDICIÓN (UPDATE)
        const { data, error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', editingId)
          .eq('user_id', user.id)
          .select()

        if (error) throw error

        setTransactions(transactions.map(t => t.id === editingId ? data[0] : t))
      } else {
        // MODO CREACIÓN (INSERT)
        const { data, error } = await supabase
          .from('transactions')
          .insert(transactionData)
          .select()

        if (error) throw error

        setTransactions([data[0], ...transactions])
      }

      handleCancelForm()
    } catch (error) {
      console.error('Error saving transaction:', error)
      alert('Error al guardar la transacción')
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
      if (editingId === transactionId) handleCancelForm()
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
    const formattedNumber = new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)

    return currency === 'USD' ? `US$${formattedNumber}` : `$${formattedNumber}`
  }

  const handleDownloadCSV = () => {
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

  const selectedCategory = formData.categoryId
    ? categories.find(c => c.id === formData.categoryId)
    : undefined

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center gap-3 py-4 sm:h-16 sm:py-0">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="font-medium">
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Volver
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-foreground tracking-tight">Mis Transacciones</h1>
            </div>
            <div className="flex gap-2">
              {transactions.length > 0 && (
                <Button
                  onClick={handleDownloadCSV}
                  className="gap-2 shadow-sm font-medium"
                  size="sm"
                  variant="outline"
                >
                  <Download className="w-4 h-4" />
                  Descargar CSV
                </Button>
              )}
              <Button
                onClick={() => isFormOpen ? handleCancelForm() : setIsFormOpen(true)}
                className="gap-2 shadow-sm font-medium"
                size="sm"
                variant={isFormOpen ? 'destructive' : 'default'}
              >
                {isFormOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isFormOpen ? 'Cancelar' : 'Nueva transacción'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isFormOpen && (
          <Card className="border-0 shadow-lg mb-8">
            <div className="h-1 w-full bg-violeta-principal rounded-t-lg" />
            <CardHeader className="pt-5">
              <CardTitle className="text-lg font-bold tracking-tight">
                {editingId ? 'Editar Transacción' : 'Agregar Nueva Transacción'}
              </CardTitle>
              <CardDescription className="font-light">
                {editingId ? 'Modificá los detalles del movimiento' : 'Registrá un ingreso o gasto'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveTransaction} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tipo */}
                  <div className="grid gap-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => {
                        if (value === 'income' || value === 'expense') {
                          setFormData(prev => ({ ...prev, type: value }))
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
                      onValueChange={(val) => handleCurrencyChange(val)}
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
                      <p className="text-xs text-muted-foreground mt-1 font-light">
                        Tasa: $1 USD = {formatAmount(exchangeRate, 'ARS')}
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
                      placeholder="0,00"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
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
                    {/* CORRECCIÓN DE TIPADO DE SHADCN: Manejo seguro para que admita strings o nulos */}
                    <Select
                      value={formData.categoryId || ''}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value || null }))}
                    >
                      <SelectTrigger id="category" className="w-full h-10">
                        <SelectValue placeholder="Selecciona una categoría">
                          {selectedCategory ? (
                            <span className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full inline-block shrink-0"
                                style={{ backgroundColor: selectedCategory.color }}
                              />
                              {selectedCategory.name}
                            </span>
                          ) : 'Selecciona una categoría'}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    className="h-10"
                  />
                </div>

                <Button type="submit" className="w-full shadow-sm font-medium" disabled={isLoading} size="lg">
                  {isLoading ? 'Guardando...' : editingId ? 'Actualizar Transacción' : 'Guardar Transacción'}
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
                <p className="text-sm text-muted-foreground font-light mb-6">Empezá registrando tu primer ingreso o gasto</p>
                <Button onClick={() => setIsFormOpen(true)} className="shadow-sm font-medium">
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
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${transaction.type === 'income'
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
                              <span className="text-xs text-muted-foreground font-light">Sin categoría</span>
                            )}
                            <span className="text-xs text-muted-foreground font-light">·</span>
                            <span className="text-xs text-muted-foreground font-light">{transaction.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <div className="text-right mr-2">
                          <p className={`font-bold text-base tracking-tight ${transaction.type === 'income'
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

                        {/* BOTÓN EDITAR */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(transaction)}
                          className="text-muted-foreground hover:text-violeta-principal hover:bg-violeta-principal/10"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>

                        {/* BOTÓN ELIMINAR */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                          title="Eliminar"
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