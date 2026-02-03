'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useStore, Transaction } from '@/store/useStore'
import { StatsCards } from '@/components/StatsCards'
import { AddTransactionDialog } from '@/components/AddTransactionDialog'
import { ManageCategoriesDialog } from '@/components/ManageCategoriesDialog'
import { MobileMenu } from '@/components/MobileMenu'
import { TransactionsList } from '@/components/TransactionsList'
import { FilterSort } from '@/components/FilterSort'
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
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const hasLoggedRef = useRef(false)
  const hasInitializedRef = useRef(false)
  const hasSyncedRef = useRef(false)

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
    updateTransaction,
    deleteTransaction,
  } = useStore()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // רשום התחברות כשהמשתמש נכנס (פעם אחת בלבד!)
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email && !hasLoggedRef.current) {
      hasLoggedRef.current = true
      // שליחה אסינכרונית - לא משפיע על הטעינה
      fetch('/api/user/log', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email })
      }).catch(err => console.error('Failed to log user:', err))
    }
  }, [status, session?.user?.email])

  useEffect(() => {
    if (!session || status !== 'authenticated') return
    
    const currentEmail = session.user?.email
    if (!currentEmail) return

    const currentYear = new Date().getFullYear()

    // בדוק אם המשתמש הנוכחי שונה מזה ששמור
    if (userEmail && currentEmail !== userEmail) {
      console.log('👤 Different user detected, reinitializing...')
      hasInitializedRef.current = false
      hasSyncedRef.current = false
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
      hasInitializedRef.current = false
      hasSyncedRef.current = false
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
    
    // אם אין spreadsheetId - צור חדש (רק פעם אחת!)
    if (!spreadsheetId && !isInitializing && !hasInitializedRef.current) {
      console.log('📝 No spreadsheet ID, creating new one...')
      hasInitializedRef.current = true
      initializeSheet(currentEmail)
      return
    }
    
    // יש spreadsheet - סנכרן (רק פעם אחת בלבד!)
    if (spreadsheetId && !loading && !isInitializing && hasInitializedRef.current && !hasSyncedRef.current) {
      console.log('🔄 First sync for spreadsheet:', spreadsheetId)
      hasSyncedRef.current = true
      syncData()
    }
  }, [status, spreadsheetId, userEmail, spreadsheetYear, session])

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

  const syncData = async (sheetId?: string, force = false) => {
    const id = sheetId || spreadsheetId
    if (!id) return

    // אם זה לא force ו-hasSyncedRef כבר true, דלג
    if (!force && hasSyncedRef.current) {
      console.log('⏭️ Already synced, skipping...')
      return
    }

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
        hasSyncedRef.current = false
        // אל תקרא ל-initializeSheet כאן - תן ל-useEffect לטפל בזה
        return
      }

      const transactionsData = await transactionsRes.json()
      const categoriesData = await categoriesRes.json()

      setTransactions(transactionsData.transactions || [])
      setCategories(categoriesData.categories || [])
      setLastSync(new Date())
      hasSyncedRef.current = true
    } catch (error) {
      console.error('Error syncing data:', error)
      // בשגיאה, נקה את ה-ID
      setSpreadsheetId('', session?.user?.email || '')
      setTransactions([])
      setCategories([])
      hasSyncedRef.current = false
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

      await syncData(undefined, true)
    } catch (error) {
      console.error('Error adding transaction:', error)
      throw error
    }
  }

  const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
    if (!spreadsheetId) return
    
    try {
      console.log('💾 Saving transaction:', updatedTransaction)
      const response = await fetch('/api/sheets/transactions/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId,
          transactionId: updatedTransaction.id,
          updates: updatedTransaction,
        }),
      })

      console.log('Response status:', response.status)
      const responseData = await response.json()
      console.log('Response data:', responseData)

      if (response.ok) {
        console.log('✅ Update successful, syncing data...')
        // עדכן ב-store
        updateTransaction(updatedTransaction.id, updatedTransaction)
        // סנכרן כדי לוודא שהנתונים תואמים
        await syncData(undefined, true)
        console.log('✅ Sync complete')
      } else {
        console.error('❌ Update failed:', responseData)
        alert('שגיאה בעדכון: ' + responseData.error)
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
      alert('שגיאה בעדכון העסקה')
    }
  }

  const handleDeleteTransaction = async (id: number) => {
    if (!spreadsheetId) return

    try {
      const response = await fetch('/api/sheets/transactions/edit', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId,
          transactionId: id,
        }),
      })

      if (response.ok) {
        deleteTransaction(id)
        // סנכרן כדי לוודא שהנתונים תואמים
        await syncData(undefined, true)
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('שגיאה במחיקת העסקה')
    }
  }

  const handleCategoryUpdate = async () => {
    if (!spreadsheetId) return
    await syncData(undefined, true)
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
              <img src="/logo.png" alt="Balance" className="h-10 w-10 sm:h-12 sm:w-12" />
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
                  onClick={() => syncData(undefined, true)}
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
                onClick={() => syncData(undefined, true)}
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

        <FilterSort 
          transactions={transactions}
          categories={categories}
          onFiltered={setFilteredTransactions}
        />

        <TransactionsList 
          transactions={filteredTransactions}
          categories={categories}
          onUpdate={handleUpdateTransaction}
          onDelete={handleDeleteTransaction}
        />
      </main>
    </div>
  )
}
