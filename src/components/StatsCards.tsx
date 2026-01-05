'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface StatsCardsProps {
  totalIncome: number
  totalExpenses: number
  balance: number
}

export function StatsCards({ totalIncome, totalExpenses, balance }: StatsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">סך הכנסות</p>
              <p className="text-3xl font-bold text-emerald-900 mt-2">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="h-14 w-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-red-200 bg-gradient-to-br from-red-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">סך הוצאות</p>
              <p className="text-3xl font-bold text-red-900 mt-2">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="h-14 w-14 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
              <TrendingDown className="h-7 w-7 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`overflow-hidden ${balance >= 0 ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-white' : 'border-orange-200 bg-gradient-to-br from-orange-50 to-white'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>יתרה</p>
              <p className={`text-3xl font-bold mt-2 ${balance >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
            <div className={`h-14 w-14 rounded-full flex items-center justify-center shadow-lg ${balance >= 0 ? 'bg-blue-500 shadow-blue-500/30' : 'bg-orange-500 shadow-orange-500/30'}`}>
              <Wallet className="h-7 w-7 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
