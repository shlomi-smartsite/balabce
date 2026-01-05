'use client'

import { useState, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Plus } from 'lucide-react'
import { SortableCategoryItem } from './SortableCategoryItem'

interface Category {
  name: string
  type: string
}

interface ManageCategoriesDialogProps {
  categories?: Category[]
  onUpdate: () => void
  spreadsheetId?: string | null
  trigger?: React.ReactNode
}

export function ManageCategoriesDialog({ categories = [], onUpdate, spreadsheetId, trigger }: ManageCategoriesDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<'הכנסה' | 'הוצאה'>('הוצאה')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null)
  const [localCategories, setLocalCategories] = useState(categories)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Update local categories when prop changes
  useEffect(() => {
    setLocalCategories(categories)
  }, [categories])

  const handleDragEnd = async (event: DragEndEvent, categoryType: 'הכנסה' | 'הוצאה') => {
    const { active, over } = event

    if (!over || active.id === over.id || !spreadsheetId) return

    const filtered = localCategories.filter(c => c.type === categoryType)
    const oldIndex = filtered.findIndex(c => `${c.name}-${c.type}` === active.id)
    const newIndex = filtered.findIndex(c => `${c.name}-${c.type}` === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = arrayMove(filtered, oldIndex, newIndex)
    
    // Update local state optimistically
    const otherType = localCategories.filter(c => c.type !== categoryType)
    setLocalCategories([...otherType, ...newOrder])

    // Save to backend
    try {
      const response = await fetch('/api/sheets/categories/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId,
          categories: newOrder,
          type: categoryType
        }),
      })

      if (!response.ok) throw new Error('Failed to reorder')
      await onUpdate()
    } catch (error) {
      console.error('Error reordering categories:', error)
      setLocalCategories(categories) // Revert on error
    }
  }

  const handleAdd = async () => {
    if (!name.trim() || !spreadsheetId) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/sheets/categories/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          spreadsheetId, 
          category: { name: name.trim(), type } 
        }),
      })

      if (!response.ok) throw new Error('Failed to add category')

      await onUpdate()
      setName('')
      setType('הוצאה')
    } catch (error) {
      console.error('Error adding category:', error)
      alert('שגיאה בהוספת קטגוריה')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (categoryName: string, categoryType: string) => {
    if (!confirm(`האם למחוק את הקטגוריה "${categoryName}"?`) || !spreadsheetId) return

    setDeletingCategory(`${categoryName}-${categoryType}`)
    try {
      const response = await fetch('/api/sheets/categories/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          spreadsheetId, 
          categoryName, 
          categoryType 
        }),
      })

      if (!response.ok) throw new Error('Failed to delete category')

      await onUpdate()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('שגיאה במחיקת קטגוריה')
    } finally {
      setDeletingCategory(null)
    }
  }

  const incomeCategories = localCategories.filter(c => c.type === 'הכנסה')
  const expenseCategories = localCategories.filter(c => c.type === 'הוצאה')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 ml-2" />
            ניהול קטגוריות
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ניהול קטגוריות</DialogTitle>
          <DialogDescription>
            הוסף, ערוך או מחק קטגוריות להכנסות והוצאות
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Category */}
          <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">הוספת קטגוריה חדשה</h3>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category-name">שם הקטגוריה</Label>
                <Input
                  id="category-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="לדוגמה: ארנונה, ביטוח, תחביבים..."
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category-type">סוג</Label>
                <Select value={type} onValueChange={(value) => setType(value as 'הכנסה' | 'הוצאה')}>
                  <SelectTrigger id="category-type" disabled={isSubmitting}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="הכנסה">הכנסה</SelectItem>
                    <SelectItem value="הוצאה">הוצאה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} disabled={isSubmitting || !name.trim()} className="w-full">
                <Plus className="h-4 w-4 ml-2" />
                {isSubmitting ? 'מוסיף...' : 'הוסף קטגוריה'}
              </Button>
            </div>
          </div>

          {/* Existing Categories */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Income Categories */}
            <div className="space-y-3">
              <h3 className="font-semibold text-emerald-700 flex items-center gap-2">
                <div className="h-3 w-3 bg-emerald-500 rounded-full"></div>
                קטגוריות הכנסה ({incomeCategories.length})
              </h3>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, 'הכנסה')}
              >
                <SortableContext
                  items={incomeCategories.map(c => `${c.name}-${c.type}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {incomeCategories.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">אין קטגוריות</p>
                    ) : (
                      incomeCategories.map((category) => (
                        <SortableCategoryItem
                          key={`${category.name}-${category.type}`}
                          id={`${category.name}-${category.type}`}
                          name={category.name}
                          type={category.type}
                          onDelete={() => handleDelete(category.name, category.type)}
                          isDeleting={deletingCategory === `${category.name}-${category.type}`}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            {/* Expense Categories */}
            <div className="space-y-3">
              <h3 className="font-semibold text-red-700 flex items-center gap-2">
                <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                קטגוריות הוצאה ({expenseCategories.length})
              </h3>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, 'הוצאה')}
              >
                <SortableContext
                  items={expenseCategories.map(c => `${c.name}-${c.type}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {expenseCategories.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">אין קטגוריות</p>
                    ) : (
                      expenseCategories.map((category) => (
                        <SortableCategoryItem
                          key={`${category.name}-${category.type}`}
                          id={`${category.name}-${category.type}`}
                          name={category.name}
                          type={category.type}
                          onDelete={() => handleDelete(category.name, category.type)}
                          isDeleting={deletingCategory === `${category.name}-${category.type}`}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
