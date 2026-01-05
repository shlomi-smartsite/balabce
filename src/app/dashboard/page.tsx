'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { StatsCards } from '@/components/StatsCards'
import { AddTransactionDialog } from '@/components/AddTransactionDialog'
import { TransactionsList } from '@/components/TransactionsList'
import { CategoryChart } from '@/components/CategoryChart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, RefreshCw, FileSpreadsheet } from 'lucide-react'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const {
    spreadsheetId,
    transactions,
    categories,
    lastSync,
    setSpreadsheetId,
    setTransactions,
    setCategories,
    setLastSync,
  } = useStore()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session && !spreadsheetId) {
      initializeSheet()
    } else if (session && spreadsheetId) {
      syncData()
    }
  }, [session, spreadsheetId])

  const initializeSheet = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/sheets/create', {
        method: 'POST',
      })
      const data = await response.json()
      
      if (data.spreadsheetId) {
        setSpreadsheetId(data.spreadsheetId)
        await syncData(data.spreadsheetId)
      }
    } catch (error) {
      console.error('Error initializing sheet:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncData = async (sheetId?: string) => {
    const id = sheetId || spreadsheetId
    if (!id) return

    setSyncing(true)
    try {
      const [transactionsRes, categoriesRes] = await Promise.all([
        fetch(`/api/sheets/transactions?spreadsheetId=${id}`),
        fetch(`/api/sheets/categories?spreadsheetId=${id}`),
      ])

      const transactionsData = await transactionsRes.json()
      const categoriesData = await categoriesRes.json()

      setTransactions(transactionsData.transactions || [])
      setCategories(categoriesData.categories || [])
      setLastSync(new Date())
    } catch (error) {
      console.error('Error syncing data:', error)
    } finally {
      setSyncing(false)
    }
  }

  const handleAddTransaction = async (transaction: any) => {
    if (!spreadsheetId) return

    try {
      const response = await fetch('/api/sheets/transactions/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadsheetId, transaction }),
      })

      if (!response.ok) throw new Error('Failed to add transaction')

      await syncData()
    } catch (error) {
      console.error('Error adding transaction:', error)
      throw error
    }
  }

  const totalIncome = transactions
    .filter((t) => t.type === 'הכנסה')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter((t) => t.type === 'הוצאה')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600">טוען...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <nav className="bg-white border-b-2 border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                Balance
              </h1>
              {spreadsheetId && (
                <a
                  href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  פתח ב-Sheets
                </a>
              )}
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-600 hidden sm:block">
                {session.user?.email}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncData()}
                disabled={syncing}
              >
                <RefreshCw className={`h-4 w-4 ml-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'מסנכרן...' : 'סנכרן'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 ml-2" />
                התנתק
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">לוח בקרה</h2>
            {lastSync && (
              <p className="text-sm text-slate-500 mt-1">
                סונכרן לאחרונה: {new Date(lastSync).toLocaleString('he-IL')}
              </p>
            )}
          </div>
          <AddTransactionDialog onAdd={handleAddTransaction} />
        </div>

        <StatsCards
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          balance={balance}
        />

        <div className="grid lg:grid-cols-2 gap-6">
          <CategoryChart transactions={transactions} type="הוצאה" />
          <CategoryChart transactions={transactions} type="הכנסה" />
        </div>

        <TransactionsList transactions={transactions} />
      </main>
    </div>
  )
}
