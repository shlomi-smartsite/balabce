import { readFile } from 'fs/promises'
import { join } from 'path'

const LOGS_FILE = join(process.cwd(), 'data', 'user-logs.json')

export interface UserLog {
  email: string
  timestamp: string
  date: string
}

export async function readLogs(): Promise<UserLog[]> {
  try {
    const data = await readFile(LOGS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

export interface UserStats {
  totalUsers: number
  totalLogins: number
  uniqueUsers: number
  todayLogins: number
  usersByDate: Record<string, number>
  topUsers: Array<{ email: string; count: number }>
}

export function getStats(): UserStats {
  try {
    const logsPath = join(process.cwd(), 'data', 'user-logs.json')
    const fs = require('fs')
    
    if (!fs.existsSync(logsPath)) {
      return {
        totalUsers: 0,
        totalLogins: 0,
        uniqueUsers: 0,
        todayLogins: 0,
        usersByDate: {},
        topUsers: []
      }
    }

    const data = fs.readFileSync(logsPath, 'utf-8')
    const logs: UserLog[] = JSON.parse(data)

    const uniqueEmails = new Set(logs.map(l => l.email))
    const today = new Date().toLocaleDateString('he-IL')
    const todayLogins = logs.filter(l => l.date === today).length

    // לוגים לפי תאריך
    const usersByDate: Record<string, number> = {}
    logs.forEach(log => {
      usersByDate[log.date] = (usersByDate[log.date] || 0) + 1
    })

    // משתמשים מובילים
    const emailCounts: Record<string, number> = {}
    logs.forEach(log => {
      emailCounts[log.email] = (emailCounts[log.email] || 0) + 1
    })
    const topUsers = Object.entries(emailCounts)
      .map(([email, count]) => ({ email, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      totalUsers: uniqueEmails.size,
      totalLogins: logs.length,
      uniqueUsers: uniqueEmails.size,
      todayLogins,
      usersByDate,
      topUsers
    }
  } catch (error) {
    console.error('Error getting stats:', error)
    return {
      totalUsers: 0,
      totalLogins: 0,
      uniqueUsers: 0,
      todayLogins: 0,
      usersByDate: {},
      topUsers: []
    }
  }
}
