import { NextRequest, NextResponse } from 'next/server'
import { reorderCategories } from '@/lib/sheets'
import { auth } from '@/app/api/auth/[...nextauth]/route'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { spreadsheetId, categories, type } = await req.json()
    
    if (!spreadsheetId || !categories || !type) {
      return NextResponse.json(
        { error: 'spreadsheetId, categories, and type are required' },
        { status: 400 }
      )
    }

    await reorderCategories(spreadsheetId, categories, type)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering categories:', error)
    return NextResponse.json(
      { error: 'Failed to reorder categories' },
      { status: 500 }
    )
  }
}
