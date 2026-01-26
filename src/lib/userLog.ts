import fs from 'fs'
import path from 'path'

interface UserLoginLog {
  email: string
  timestamp: string
  action: 'login' | 'logout'
}

const LOG_FILE = path.join(process.cwd(), 'data', 'user-logs.json')

// יצירת תיקיית data אם לא קיימת
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// קריאת לוגים
export function readLogs(): UserLoginLog[] {
  try {
    ensureDataDir()
    if (!fs.existsSync(LOG_FILE)) {
      return []
    }
    const data = fs.readFileSync(LOG_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading logs:', error)
    return []
  }
}

// הוספת לוג
export function addLog(email: string, action: 'login' | 'logout') {
  try {
    ensureDataDir()
    const logs = readLogs()
    const newLog: UserLoginLog = {
      email,
      timestamp: new Date().toISOString(),
      action,
    }
    logs.push(newLog)
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2))
    console.log(`📝 User ${action}:`, email)
  } catch (error) {
    console.error('Error writing log:', error)
  }
}

// סטטיסטיקות
export function getStats() {
  const logs = readLogs()
  const uniqueUsers = new Set(logs.map(log => log.email))
  const loginLogs = logs.filter(log => log.action === 'login')
  
  // מספר התחברויות ב-7 ימים אחרונים
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentLogins = loginLogs.filter(
    log => new Date(log.timestamp) > sevenDaysAgo
  )
  
  // משתמשים פעילים ב-7 ימים אחרונים
  const activeUsers = new Set(recentLogins.map(log => log.email))
  
  // התחברות אחרונה לכל משתמש
  const lastLoginByUser = new Map<string, string>()
  loginLogs.forEach(log => {
    const current = lastLoginByUser.get(log.email)
    if (!current || new Date(log.timestamp) > new Date(current)) {
      lastLoginByUser.set(log.email, log.timestamp)
    }
  })

  return {
    totalUsers: uniqueUsers.size,
    totalLogins: loginLogs.length,
    activeUsersLast7Days: activeUsers.size,
    loginsLast7Days: recentLogins.length,
    users: Array.from(lastLoginByUser.entries()).map(([email, lastLogin]) => ({
      email,
      lastLogin,
    })),
  }
}
