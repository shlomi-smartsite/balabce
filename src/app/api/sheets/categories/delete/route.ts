import { NextRequest, NextResponse } from 'next/server'
import { deleteCategory } from '@/lib/sheets'
import { auth } from '@/app/api/auth/[...nextauth]/route'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { spreadsheetId, categoryName, categoryType } = await req.json()
    
    if (!spreadsheetId || !categoryName || !categoryType) {
      return NextResponse.json(
        { error: 'spreadsheetId, categoryName, and categoryType are required' },
        { status: 400 }
      )
    }

    await deleteCategory(spreadsheetId, categoryName, categoryType)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
