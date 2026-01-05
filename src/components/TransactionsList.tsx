'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Transaction } from '@/store/useStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface TransactionsListProps {
  transactions: Transaction[]
}

export function TransactionsList({ transactions }: TransactionsListProps) {
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>עסקאות אחרונות</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedTransactions.length === 0 ? (
            <p className="text-center text-slate-500 py-8">אין עסקאות להצגה</p>
          ) : (
            sortedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border-2 border-slate-100 hover:border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      transaction.type === 'הכנסה'
                        ? 'bg-emerald-100'
                        : 'bg-red-100'
                    }`}
                  >
                    {transaction.type === 'הכנסה' ? (
                      <TrendingUp className="h-6 w-6 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {transaction.description || transaction.category}
                    </p>
                    <p className="text-sm text-slate-500">
                      {transaction.category} • {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p
                    className={`text-xl font-bold ${
                      transaction.type === 'הכנסה'
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'הכנסה' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-slate-500">{transaction.paymentMethod}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
