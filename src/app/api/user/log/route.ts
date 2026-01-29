import { writeFile, readFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const LOGS_FILE = join(process.cwd(), 'data', 'user-logs.json')

interface UserLog {
  email: string
  timestamp: string
  date: string
}

async function readLogs(): Promise<UserLog[]> {
  try {
    const data = await readFile(LOGS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function saveLogs(logs: UserLog[]): Promise<void> {
  const logsDir = join(process.cwd(), 'data')
  if (!existsSync(logsDir)) {
    await mkdir(logsDir, { recursive: true })
  }
  await writeFile(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf-8')
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return Response.json({ error: 'Missing email' }, { status: 400 })
    }

    const logs = await readLogs()
    const now = new Date()
    
    logs.push({
      email,
      timestamp: now.toISOString(),
      date: now.toLocaleDateString('he-IL')
    })

    await saveLogs(logs)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error logging user:', error)
    return Response.json({ error: 'Failed to log user' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const logs = await readLogs()
    
    const uniqueUsers = new Set(logs.map(log => log.email))
    
    const userStats = Array.from(uniqueUsers).map(email => ({
      email,
      loginCount: logs.filter(log => log.email === email).length,
      lastLogin: logs
        .filter(log => log.email === email)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]?.timestamp
    }))

    return Response.json({
      totalLogins: logs.length,
      uniqueUsers: uniqueUsers.size,
      userStats: userStats.sort((a, b) => b.loginCount - a.loginCount),
      logs: logs.slice(-100)
    })
  } catch (error) {
    console.error('Error reading logs:', error)
    return Response.json({ error: 'Failed to read logs' }, { status: 500 })
  }
}
