'use client'

import { useState, useEffect } from 'react'
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
}

export function FilterSort({ 
  transactions, 
  categories,
  onFiltered,
}: FilterSortProps) {
  const [type, setType] = useState<'הכנסה' | 'הוצאה' | 'הכל'>('הכל')
  const [category, setCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc')
  const [searchText, setSearchText] = useState<string>('')
  const [minAmount, setMinAmount] = useState<string>('')
  const [maxAmount, setMaxAmount] = useState<string>('')
  const [hasFilters, setHasFilters] = useState(false)

  // כשמשנים את המיון - הפעל אוטומטית
  useEffect(() => {
    applyFilters()
  }, [sortBy])

  // כשמשנים את העסקאות - הפעל שוב את הסינון
  useEffect(() => {
    applyFilters()
  }, [transactions])

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
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case 'amount-desc':
          console.log('💰 Sorting by amount desc:', a.amount, b.amount, b.amount - a.amount)
          return b.amount - a.amount
        case 'amount-asc':
          return a.amount - b.amount
        default:
          return 0
      }
    })

    console.log('🔍 Filtered & sorted transactions:', { type, category, sortBy, searchText, count: filtered.length })
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
    onFiltered([...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ))
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
