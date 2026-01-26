'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Transaction } from '@/store/useStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TrendingUp, TrendingDown, Edit2 } from 'lucide-react'
import { EditTransactionDialog } from './EditTransactionDialog'

interface TransactionsListProps {
  transactions: Transaction[]
  categories: { name: string; type: 'הכנסה' | 'הוצאה' }[]
  onUpdate: (transaction: Transaction) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export function TransactionsList({ 
  transactions, 
  categories,
  onUpdate,
  onDelete,
}: TransactionsListProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [displayCount, setDisplayCount] = useState(20)

  // אל תעשה sorting כאן - השתמש בעסקאות כפי שהן (כבר ממויינות מ-FilterSort)
  const visibleTransactions = transactions.slice(0, displayCount)
  const editingTransaction = transactions.find(t => t.id === editingId)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>עסקאות אחרונות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-center text-gray-600 font-medium py-8">אין עסקאות להצגה</p>
            ) : (
              <>
                {visibleTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border-2 border-slate-100 hover:border-slate-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
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
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">
                          {transaction.description || transaction.category}
                        </p>
                        <p className="text-sm text-gray-600 font-medium">
                          {transaction.category} • {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
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
                        <p className="text-xs text-gray-600 font-medium">{transaction.paymentMethod}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(transaction.id)}
                        className="ml-2"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {displayCount < transactions.length && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setDisplayCount(displayCount + 20)}
                  >
                    טען עוד ({transactions.length - displayCount} נותרו)
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {editingTransaction && (
        <EditTransactionDialog
          transaction={editingTransaction}
          open={editingId !== null}
          onOpenChange={(open) => !open && setEditingId(null)}
          onUpdate={onUpdate}
          onDelete={onDelete}
          categories={categories}
        />
      )}
    </>
  )
}
