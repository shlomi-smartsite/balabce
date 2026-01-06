import { NextRequest, NextResponse } from 'next/server'
import { createBalanceSheet } from '@/lib/sheets'
import { auth } from '@/app/api/auth/[...nextauth]/route'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      console.log('❌ No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ Creating spreadsheet for:', session.user.email)
    
    const spreadsheetId = await createBalanceSheet(
      session.user.email || '',
      session.user.email || ''
    )

    console.log('✅ Spreadsheet created/found:', spreadsheetId)
    return NextResponse.json({ spreadsheetId })
  } catch (error) {
    console.error('❌ Error creating sheet:', error)
    return NextResponse.json(
      { error: 'Failed to create spreadsheet' },
      { status: 500 }
    )
  }
}
