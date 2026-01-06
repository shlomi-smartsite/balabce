import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Transaction {
  id: number
  date: string
  type: 'הכנסה' | 'הוצאה'
  category: string
  amount: number
  description: string
  paymentMethod: string
}

export interface Category {
  name: string
  type: 'הכנסה' | 'הוצאה'
}

interface StoreState {
  spreadsheetId: string | null
  userEmail: string | null
  spreadsheetYear: number | null
  transactions: Transaction[]
  categories: Category[]
  isLoading: boolean
  lastSync: Date | null
  
  setSpreadsheetId: (id: string, email: string) => void
  setUserEmail: (email: string) => void
  setTransactions: (transactions: Transaction[]) => void
  setCategories: (categories: Category[]) => void
  addTransaction: (transaction: Transaction) => void
  setLoading: (isLoading: boolean) => void
  setLastSync: (date: Date) => void
  reset: () => void
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      spreadsheetId: null,
      userEmail: null,
      spreadsheetYear: null,
      transactions: [],
      categories: [],
      isLoading: false,
      lastSync: null,

      setSpreadsheetId: (id, email) => set({ 
        spreadsheetId: id, 
        userEmail: email,
        spreadsheetYear: new Date().getFullYear()
      }),
      setUserEmail: (email) => set({ userEmail: email }),
      setTransactions: (transactions) => set({ transactions }),
      setCategories: (categories) => set({ categories }),
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [...state.transactions, transaction],
        })),
      setLoading: (isLoading) => set({ isLoading }),
      setLspreadsheetYear: null,
          astSync: (date) => set({ lastSync: date }),
      reset: () =>
        set({
          spreadsheetId: null,
          userEmail: null,
          transactions: [],
          categories: [],
          isLoading: false,
          lastSync: null,
        }),
    }),
    {
      name: 'balance-storage',
    }
  )
)
