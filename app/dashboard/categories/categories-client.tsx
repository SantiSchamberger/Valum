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
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
  })

  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#14B8A6', // Teal
  ]

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!formData.name) {
        alert('Por favor ingresa el nombre de la categoría')
        return
      }

      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: formData.name,
          color: formData.color,
          icon: 'tag',
        })
        .select()

      if (error) throw error

      setCategories([...categories, data[0]])
      setFormData({ name: '', color: '#3B82F6' })
      setIsAddingNew(false)
    } catch (error) {
      console.error('Error adding category:', error)
      alert('Error al agregar categoría')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) return

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
              <h1 className="text-2xl font-bold text-foreground">Categorías</h1>
            </div>
            <Button 
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="gap-2"
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
          <Card className="border-2 mb-8 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle>Crear Nueva Categoría</CardTitle>
              <CardDescription>
                Organiza tus transacciones por categorías
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCategory} className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre de la categoría</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Alimentación, Transporte, Entretenimiento..."
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                    {colors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-10 h-10 rounded-lg transition-transform ${
                          formData.color === color ? 'scale-110 ring-2 ring-offset-2 ring-foreground' : ''
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({...formData, color})}
                      />
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                  {isLoading ? 'Creando...' : 'Crear Categoría'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <Card className="border-2">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="flex justify-center mb-4">
                <Tag className="w-12 h-12 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">No hay categorías creadas</p>
              <Button onClick={() => setIsAddingNew(true)}>
                Crear tu primera categoría
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(category => (
              <Card key={category.id} className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: category.color }}
                      >
                        <Tag className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{category.name}</p>
                        <p className="text-xs text-muted-foreground">{category.color}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
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
