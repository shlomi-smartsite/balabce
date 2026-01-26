'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useStore, Transaction, Category } from '@/store/useStore'
import { X } from 'lucide-react'

interface EditTransactionDialogProps {
  transaction: Transaction
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (transaction: Transaction) => Promise<void>
  onDelete: (id: number) => Promise<void>
  categories: Category[]
}

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  categories,
}: EditTransactionDialogProps) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    date: transaction.date,
    type: transaction.type,
    category: transaction.category,
    amount: transaction.amount.toString(),
    description: transaction.description,
    paymentMethod: transaction.paymentMethod,
  })

  const filteredCategories = categories.filter((cat) => cat.type === formData.type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updatedTransaction: Transaction = {
        id: transaction.id,
        date: formData.date,
        type: formData.type as 'הכנסה' | 'הוצאה',
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        paymentMethod: formData.paymentMethod,
      }
      
      console.log('📤 Submitting updated transaction:', updatedTransaction)
      await onUpdate(updatedTransaction)
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating transaction:', error)
      alert('שגיאה בשמירת העסקה')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('בטוח שברצונך למחוק את העסקה?')) {
      setDeleting(true)
      try {
        await onDelete(transaction.id)
        onOpenChange(false)
      } catch (error) {
        console.error('Error deleting transaction:', error)
      } finally {
        setDeleting(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>עריכת עסקה</DialogTitle>
          <DialogDescription>
            עדכן את פרטי העסקה
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">תאריך</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">סוג</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'הכנסה' | 'הוצאה') => 
                  setFormData({ ...formData, type: value, category: '' })
                }
              >
                <SelectTrigger className="font-bold">
                  <SelectValue placeholder="בחר סוג" className="font-bold" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="הכנסה" className="font-bold">הכנסה</SelectItem>
                  <SelectItem value="הוצאה" className="font-bold">הוצאה</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">קטגוריה</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="font-bold">
                  <SelectValue placeholder="בחר קטגוריה" className="font-bold" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name} className="font-bold">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">סכום (₪)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">תיאור</Label>
              <Input
                id="description"
                placeholder="תיאור העסקה"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">אמצעי תשלום</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
              >
                <SelectTrigger className="font-bold">
                  <SelectValue placeholder="בחר אמצעי תשלום" className="font-bold" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="מזומן" className="font-bold">מזומן</SelectItem>
                  <SelectItem value="אשראי" className="font-bold">אשראי</SelectItem>
                  <SelectItem value="העברה בנקאית" className="font-bold">העברה בנקאית</SelectItem>
                  <SelectItem value="אפליקציה" className="font-bold">אפליקציה</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-between">
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
              size="sm"
            >
              {deleting ? 'מוחק...' : 'מחק'}
            </Button>
            <Button type="submit" disabled={loading} size="lg">
              {loading ? 'שומר...' : 'שמירה'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
