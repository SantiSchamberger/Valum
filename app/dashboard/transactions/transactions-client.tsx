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
import { ArrowLeft, Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
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
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
  })

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
      })
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
    if (!categoryId) return 'Sin categoría'
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Categoría desconocida'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Mis Transacciones</h1>
            </div>
            <Button 
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              {isAddingNew ? 'Cancelar' : 'Nueva transacción'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAddingNew && (
          <Card className="border-2 mb-8 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle>Agregar Nueva Transacción</CardTitle>
              <CardDescription>
                Registra un ingreso o gasto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddTransaction} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => setFormData({...formData, type: value as 'income' | 'expense'})}
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Ingreso</SelectItem>
                        <SelectItem value="expense">Gasto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="amount">Monto</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select 
                      value={formData.categoryId} 
                      onValueChange={(value) => setFormData({...formData, categoryId: value})}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    placeholder="Ej: Salario mensual, Compra de groceries..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                  {isLoading ? 'Guardando...' : 'Guardar Transacción'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Transactions List */}
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <Card className="border-2">
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-muted-foreground mb-4">No hay transacciones registradas</p>
                <Button onClick={() => setIsAddingNew(true)}>
                  Agregar tu primera transacción
                </Button>
              </CardContent>
            </Card>
          ) : (
            transactions.map(transaction => (
              <Card key={transaction.id} className="border hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className={`w-6 h-6 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`} />
                        ) : (
                          <TrendingDown className="w-6 h-6 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{getCategoryName(transaction.category_id)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`font-bold text-lg ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">{transaction.date}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
