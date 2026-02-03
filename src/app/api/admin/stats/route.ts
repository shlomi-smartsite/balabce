import { NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { getStats, readLogs } from '@/lib/userLog'

export async function GET() {
  try {
    const session = await auth()
    
    // רק מנהל יכול לראות סטטיסטיקות (אפשר לשנות את המייל)
    if (!session?.user?.email || session.user.email !== 'ah.shlomi7@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = getStats()
    const logs = await readLogs()

    return NextResponse.json({
      stats,
      recentLogs: logs.slice(-50).reverse(), // 50 לוגים אחרונים
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
