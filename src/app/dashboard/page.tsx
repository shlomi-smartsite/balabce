'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { StatsCards } from '@/components/StatsCards'
import { AddTransactionDialog } from '@/components/AddTransactionDialog'
import { ManageCategoriesDialog } from '@/components/ManageCategoriesDialog'
import { MobileMenu } from '@/components/MobileMenu'
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
  const [isInitializing, setIsInitializing] = useState(false)

  const {
    spreadsheetId,
    userEmail,
    spreadsheetYear,
    transactions,
    categories,
    lastSync,
    setSpreadsheetId,
    setUserEmail,
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
    if (!session) return
    
    const currentEmail = session.user?.email
    if (!currentEmail) return

    const currentYear = new Date().getFullYear()

    // בדוק אם המשתמש הנוכחי שונה מזה ששמור
    if (userEmail && currentEmail !== userEmail) {
      // משתמש אחר - צריך לאתחל מחדש
      console.log('👤 Different user detected, reinitializing...')
      setSpreadsheetId('', currentEmail)
      setUserEmail(currentEmail)
      if (!isInitializing) {
        initializeSheet(currentEmail)
      }
      return
    }
    
    // בדוק אם השנה השתנתה - צור קובץ חדש לשנה החדשה!
    if (spreadsheetYear && currentYear !== spreadsheetYear) {
      console.log(`🎉 שנה חדשה! ${spreadsheetYear} → ${currentYear}. יוצר קובץ חדש...`)
      setSpreadsheetId('', currentEmail)
      if (!isInitializing) {
        initializeSheet(currentEmail)
      }
      return
    }
    
    // אם אין userEmail שמור - צריך לאתחל
    if (!userEmail) {
      setUserEmail(currentEmail)
    }
    
    // אם אין spreadsheetId - צור חדש (רק אם לא כבר באמצע יצירה)
    if (!spreadsheetId && !isInitializing) {
      console.log('📝 No spreadsheet ID, creating new one...')
      initializeSheet(currentEmail)
      return
    }
    
    // יש spreadsheet - סנכרן (רק אם לא במצב loading או initializing)
    if (spreadsheetId && !loading && !isInitializing) {
      syncData()
    }
  }, [session, spreadsheetId, userEmail, spreadsheetYear, loading, isInitializing])

  const initializeSheet = async (email: string) => {
    if (isInitializing) {
      console.log('⏸️ Already initializing, skipping...')
      return
    }
    
    setIsInitializing(true)
    setLoading(true)
    try {
      const response = await fetch('/api/sheets/create', {
        method: 'POST',
      })
      const data = await response.json()
      
      if (data.spreadsheetId) {
        console.log('✅ Setting new spreadsheet ID:', data.spreadsheetId)
        setSpreadsheetId(data.spreadsheetId, email)
        // אל תקרא ל-syncData מיד - תן לקובץ להיווצר
        // useEffect יטפל בסנכרון אחרי שה-ID יתעדכן
      }
    } catch (error) {
      console.error('Error initializing sheet:', error)
    } finally {
      setLoading(false)
      setIsInitializing(false)
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

      // אם הקובץ לא קיים (404 או 500), נקה ויצור חדש
      if (!transactionsRes.ok || !categoriesRes.ok) {
        console.log('❌ Spreadsheet not found, clearing and creating new one...')
        // נקה את ה-ID הישן
        setSpreadsheetId('', session?.user?.email || '')
        setTransactions([])
        setCategories([])
        setSyncing(false)
        // אל תקרא ל-initializeSheet כאן - תן ל-useEffect לטפל בזה
        return
      }

      const transactionsData = await transactionsRes.json()
      const categoriesData = await categoriesRes.json()

      setTransactions(transactionsData.transactions || [])
      setCategories(categoriesData.categories || [])
      setLastSync(new Date())
    } catch (error) {
      console.error('Error syncing data:', error)
      // בשגיאה, נקה את ה-ID
      setSpreadsheetId('', session?.user?.email || '')
      setTransactions([])
      setCategories([])
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

  const handleCategoryUpdate = async () => {
    if (!spreadsheetId) return
    await syncData()
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
          <p className="text-gray-800 font-medium">טוען...</p>
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
                  className="hidden lg:flex text-sm text-blue-600 hover:text-blue-700 items-center gap-1"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  פתח ב-Sheets
                </a>
              )}
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-700 font-medium hidden sm:block">
                {session.user?.email}
              </p>
              
              {/* Mobile Menu */}
              <MobileMenu 
                spreadsheetId={spreadsheetId}
                categories={categories}
                onCategoriesUpdate={handleCategoryUpdate}
              />
              
              {/* Desktop Actions */}
              <div className="hidden lg:flex items-center gap-3">
                <ManageCategoriesDialog 
                  categories={categories} 
                  spreadsheetId={spreadsheetId}
                  onUpdate={handleCategoryUpdate}
                />
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
              
              {/* Mobile Sync & Logout */}
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => syncData()}
                disabled={syncing}
              >
                <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="lg:hidden"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">לוח בקרה</h2>
            {lastSync && (
              <p className="text-sm text-gray-600 font-medium mt-1">
                סונכרן לאחרונה: {lastSync.toLocaleString('he-IL')}
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
