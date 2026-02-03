import { NextRequest, NextResponse } from 'next/server'
import { addTransaction } from '@/lib/sheets'
import { auth } from '@/app/api/auth/[...nextauth]/route'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { spreadsheetId, transaction } = await req.json()
    
    console.log('📝 Adding transaction:', { spreadsheetId, transaction })
    
    if (!spreadsheetId || !transaction) {
      return NextResponse.json(
        { error: 'spreadsheetId and transaction are required' },
        { status: 400 }
      )
    }

    await addTransaction(spreadsheetId, transaction)
    
    console.log('✅ Transaction added successfully!')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ Error adding transaction:', error)
    console.error('Error details:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
      code: error?.code
    })
    return NextResponse.json(
      { error: error?.message || 'Failed to add transaction' },
      { status: 500 }
    )
  }
}
