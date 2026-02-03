'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Search } from 'lucide-react'
import { Transaction } from '@/store/useStore'

interface FilterSortProps {
  transactions: Transaction[]
  categories: { name: string; type: 'הכנסה' | 'הוצאה' }[]
  onFiltered: (transactions: Transaction[]) => void
  lastSync?: Date
}

export function FilterSort({ 
  transactions, 
  categories,
  onFiltered,
  lastSync,
}: FilterSortProps) {
  const [type, setType] = useState<'הכנסה' | 'הוצאה' | 'הכל'>('הכל')
  const [category, setCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc')
  const [searchText, setSearchText] = useState<string>('')
  const [minAmount, setMinAmount] = useState<string>('')
  const [maxAmount, setMaxAmount] = useState<string>('')
  const [hasFilters, setHasFilters] = useState(false)

  // כשהעסקאות משתנות - הפעל אוטומטית
  useEffect(() => {
    applyFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, transactions.length, lastSync])

  // כשמשנים את המיון - הפעל מיד
  useEffect(() => {
    applyFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy])

  const applyFilters = () => {
    let filtered = [...transactions]

    // חיפוש חופשי בטקסט
    if (searchText.trim()) {
      const search = searchText.toLowerCase()
      filtered = filtered.filter(t => 
        (t.description?.toLowerCase().includes(search)) ||
        (t.category?.toLowerCase().includes(search))
      )
    }

    // סינן לפי סוג
    if (type !== 'הכל') {
      filtered = filtered.filter(t => t.type === type)
    }

    // סינן לפי קטגוריה
    if (category !== 'all') {
      filtered = filtered.filter(t => t.category === category)
    }

    // סינן לפי סכום מינימום
    if (minAmount) {
      const min = parseFloat(minAmount)
      filtered = filtered.filter(t => t.amount >= min)
    }

    // סינן לפי סכום מקסימום
    if (maxAmount) {
      const max = parseFloat(maxAmount)
      filtered = filtered.filter(t => t.amount <= max)
    }

    // מיון
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': {
          const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
          // אם התאריכים זהים, מיין לפי ID (גדול ראשון = חדש ראשון)
          return dateDiff !== 0 ? dateDiff : b.id - a.id
        }
        case 'date-asc': {
          const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime()
          // אם התאריכים זהים, מיין לפי ID (קטן ראשון = ישן ראשון)
          return dateDiff !== 0 ? dateDiff : a.id - b.id
        }
        case 'amount-desc': {
          const amountDiff = b.amount - a.amount
          // אם הסכומים זהים, מיין לפי תאריך (חדש ראשון)
          return amountDiff !== 0 ? amountDiff : new Date(b.date).getTime() - new Date(a.date).getTime()
        }
        case 'amount-asc': {
          const amountDiff = a.amount - b.amount
          // אם הסכומים זהים, מיין לפי תאריך (חדש ראשון)
          return amountDiff !== 0 ? amountDiff : new Date(b.date).getTime() - new Date(a.date).getTime()
        }
        default:
          return 0
      }
    })

    onFiltered(filtered)
    setHasFilters(type !== 'הכל' || category !== 'all' || searchText !== '' || minAmount !== '' || maxAmount !== '')
  }

  const clearFilters = () => {
    setType('הכל')
    setCategory('all')
    setSortBy('date-desc')
    setSearchText('')
    setMinAmount('')
    setMaxAmount('')
    setHasFilters(false)
    onFiltered([...transactions].sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
      return dateDiff !== 0 ? dateDiff : b.id - a.id
    }))
  }

  const availableCategories = type === 'הכל' 
    ? categories 
    : categories.filter(c => c.type === type)

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* סוג */}
          <div className="grid gap-2">
            <Label htmlFor="type">סוג</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger className="font-bold">
                <SelectValue placeholder="בחר סוג" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="הכל" className="font-bold">הכל</SelectItem>
                <SelectItem value="הכנסה" className="font-bold">הכנסה</SelectItem>
                <SelectItem value="הוצאה" className="font-bold">הוצאה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* קטגוריה */}
          <div className="grid gap-2">
            <Label htmlFor="category">קטגוריה</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="font-bold">
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">הכל</SelectItem>
                {availableCategories.map((cat, idx) => (
                  <SelectItem key={`${cat.type}-${cat.name}-${idx}`} value={cat.name} className="font-bold">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* חיפוש חופשי */}
          <div className="grid gap-2">
            <Label htmlFor="search">חיפוש</Label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                type="text"
                placeholder="חפש לפי תיאור או קטגוריה..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {/* סכום */}
          <div className="grid gap-2">
            <Label>סכום (₪)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="מינימום"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="text-sm"
              />
              <Input
                type="number"
                placeholder="מקסימום"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* כפתורים ומיון */}
        <div className="flex items-center gap-3 justify-between">
          <div className="flex gap-2">
            <Button 
              onClick={applyFilters}
              size="sm"
            >
              <Search className="h-4 w-4 ml-1" />
              סנן
            </Button>
            {hasFilters && (
              <Button 
                onClick={clearFilters}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4 ml-1" />
                נקה הכל
              </Button>
            )}
          </div>

          {/* מיון */}
          <div className="flex items-center gap-2">
            <Label htmlFor="sort" className="text-sm whitespace-nowrap">מיון:</Label>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="font-bold w-[200px]">
                <SelectValue placeholder="בחר מיון" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc" className="font-bold">תאריך (חדש ראשון)</SelectItem>
                <SelectItem value="date-asc" className="font-bold">תאריך (ישן ראשון)</SelectItem>
                <SelectItem value="amount-desc" className="font-bold">סכום (גדול ראשון)</SelectItem>
                <SelectItem value="amount-asc" className="font-bold">סכום (קטן ראשון)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
