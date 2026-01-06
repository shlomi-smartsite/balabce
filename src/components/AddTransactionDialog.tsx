'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { useStore, Category } from '@/store/useStore'

interface AddTransactionDialogProps {
  onAdd: (transaction: any) => Promise<void>
}

export function AddTransactionDialog({ onAdd }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const categories = useStore((state) => state.categories)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'הוצאה' as 'הכנסה' | 'הוצאה',
    category: '',
    amount: '',
    description: '',
    paymentMethod: 'מזומן',
  })

  const filteredCategories = categories.filter((cat) => cat.type === formData.type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onAdd({
        ...formData,
        amount: parseFloat(formData.amount),
      })
      
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: 'הוצאה',
        category: '',
        amount: '',
        description: '',
        paymentMethod: 'מזומן',
      })
      setOpen(false)
    } catch (error) {
      console.error('Error adding transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="shadow-xl">
          <Plus className="ml-2 h-5 w-5" />
          הוספת עסקה
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>הוספת עסקה חדשה</DialogTitle>
          <DialogDescription>
            הוסף הכנסה או הוצאה חדשה למעקב הפיננסי שלך
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
          <DialogFooter>
            <Button type="submit" disabled={loading} size="lg">
              {loading ? 'שומר...' : 'שמירה'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
