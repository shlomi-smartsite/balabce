'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'

interface UserStat {
  email: string
  loginCount: number
  lastLogin?: string
}

interface StatsData {
  totalLogins: number
  uniqueUsers: number
  userStats: UserStat[]
  logs: Array<{ email: string; timestamp: string; date: string }>
}

export default function StatsPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const hasFetchedRef = useRef(false)

  const ADMIN_EMAIL = 'ah.shlomi7@gmail.com'

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email === ADMIN_EMAIL && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchStats()
    } else if (status === 'authenticated' && session?.user?.email !== ADMIN_EMAIL) {
      setLoading(false)
    }
  }, [status, session?.user?.email])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/user/log')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'unauthenticated') {
    return <div className="p-6 text-center">יש לך לא גישה</div>
  }

  if (session?.user?.email !== ADMIN_EMAIL) {
    return <div className="p-6 text-center">אתה לא מנהל</div>
  }

  if (loading) {
    return <div className="p-6 text-center">טוען...</div>
  }

  if (!stats) {
    return <div className="p-6 text-center">לא היה אפשר לטעון את הנתונים</div>
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">📊 סטטיסטיקות התחברויות</h1>

        {/* סטטיסטיקות כללי */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-slate-800 border-purple-500">
            <p className="text-slate-400 text-sm mb-2">סה"כ התחברויות</p>
            <p className="text-4xl font-bold text-white">{stats.totalLogins}</p>
          </Card>
          <Card className="p-6 bg-slate-800 border-purple-500">
            <p className="text-slate-400 text-sm mb-2">משתמשים ייחודיים</p>
            <p className="text-4xl font-bold text-white">{stats.uniqueUsers}</p>
          </Card>
        </div>

        {/* טבלה של משתמשים */}
        <Card className="p-6 bg-slate-800 border-purple-500">
          <h2 className="text-xl font-bold text-white mb-6">👥 משתמשים</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500">
                  <th className="text-right p-4 text-slate-400">אימייל</th>
                  <th className="text-right p-4 text-slate-400">התחברויות</th>
                  <th className="text-right p-4 text-slate-400">התחברות אחרונה</th>
                </tr>
              </thead>
              <tbody>
                {stats.userStats.map((user) => (
                  <tr key={user.email} className="border-b border-slate-700 hover:bg-slate-700">
                    <td className="p-4 text-white">{user.email}</td>
                    <td className="p-4 text-white font-bold">{user.loginCount}</td>
                    <td className="p-4 text-slate-400">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString('he-IL')
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* האחרוני 100 התחברויות */}
        <Card className="p-6 bg-slate-800 border-purple-500 mt-8">
          <h2 className="text-xl font-bold text-white mb-6">📋 לוג התחברויות</h2>
          <div className="max-h-96 overflow-y-auto">
            {stats.logs.map((log, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 border-b border-slate-700 text-sm"
              >
                <span className="text-slate-300">{log.email}</span>
                <span className="text-slate-500">{new Date(log.timestamp).toLocaleString('he-IL')}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

