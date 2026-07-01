'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, Trash2, Tag } from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

interface CategoriesClientProps {
  user: any
  initialCategories: Category[]
}

export default function CategoriesClient({ user, initialCategories }: CategoriesClientProps) {
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    color: '#10B981',
  })

  const colors = [
    { hex: '#3B82F6', label: 'Azul' },
    { hex: '#10B981', label: 'Verde' },
    { hex: '#F59E0B', label: 'Ámbar' },
    { hex: '#EF4444', label: 'Rojo' },
    { hex: '#8B5CF6', label: 'Violeta' },
    { hex: '#EC4899', label: 'Rosa' },
    { hex: '#06B6D4', label: 'Cyan' },
    { hex: '#14B8A6', label: 'Teal' },
    { hex: '#F97316', label: 'Naranja' },
    { hex: '#6366F1', label: 'Índigo' },
    { hex: '#84CC16', label: 'Lima' },
    { hex: '#64748B', label: 'Gris' },
  ]

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!formData.name.trim()) {
        alert('Por favor ingresá el nombre de la categoría')
        return
      }

      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: formData.name.trim(),
          color: formData.color,
          icon: 'tag',
        })
        .select()

      if (error) throw error

      setCategories([...categories, data[0]])
      setFormData({ name: '', color: '#10B981' })
      setIsAddingNew(false)
    } catch (error) {
      console.error('Error adding category:', error)
      alert('Error al agregar categoría')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar esta categoría?')) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', user.id)

      if (error) throw error

      setCategories(categories.filter(c => c.id !== categoryId))
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Error al eliminar categoría')
    }
  }

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
              <h1 className="text-xl font-bold text-foreground">Categorías</h1>
            </div>
            <Button 
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="gap-2 shadow-sm"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              {isAddingNew ? 'Cancelar' : 'Nueva categoría'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAddingNew && (
          <Card className="border-0 shadow-lg mb-8">
            <div className="h-1 w-full bg-gradient-to-r from-primary to-secondary rounded-t-lg" />
            <CardHeader className="pt-5">
              <CardTitle className="text-lg font-bold">Crear Nueva Categoría</CardTitle>
              <CardDescription>
                Organizá tus transacciones por categorías personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCategory} className="space-y-5">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre de la categoría</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Alimentación, Transporte, Entretenimiento..."
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="h-10"
                  />
                </div>

                <div className="grid gap-3">
                  <Label>Color</Label>
                  <div className="grid grid-cols-6 sm:grid-cols-12 gap-2.5">
                    {colors.map(({ hex, label }) => (
                      <button
                        key={hex}
                        type="button"
                        title={label}
                        className={`w-9 h-9 rounded-xl transition-all hover:scale-110 active:scale-95 ${
                          formData.color === hex ? 'scale-110 ring-2 ring-offset-2 ring-foreground shadow-md' : 'ring-1 ring-transparent ring-offset-1'
                        }`}
                        style={{ backgroundColor: hex }}
                        onClick={() => setFormData({...formData, color: hex})}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg border border-border shadow-sm"
                      style={{ backgroundColor: formData.color }}
                    />
                    <span className="text-xs text-muted-foreground font-mono">{formData.color}</span>
                  </div>
                </div>

                <Button type="submit" className="w-full shadow-sm" disabled={isLoading} size="lg">
                  {isLoading ? 'Creando...' : 'Crear Categoría'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="pt-16 pb-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground mb-2">No hay categorías creadas</p>
              <p className="text-sm text-muted-foreground mb-6">Creá categorías para organizar mejor tus transacciones</p>
              <Button onClick={() => setIsAddingNew(true)} className="shadow-sm">
                Crear tu primera categoría
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => (
              <Card key={category.id} className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                <div className="h-1 rounded-t-lg" style={{ backgroundColor: category.color }} />
                <CardContent className="py-4 px-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                        style={{ backgroundColor: category.color }}
                      >
                        <Tag className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{category.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <p className="text-xs text-muted-foreground font-mono">{category.color}</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="shrink-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
