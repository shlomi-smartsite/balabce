import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { google } from 'googleapis'

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.accessToken) {
      console.error('❌ No access token available')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { spreadsheetId, transactionId, updates } = await request.json()
    
    console.log('🔧 Updating transaction:', { transactionId, updates })

    if (!spreadsheetId || !transactionId || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    })

    const sheets = google.sheets({
      version: 'v4',
      auth: oauth2Client,
    })

    // קרא את כל העסקאות כדי למצוא את השורה
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Transactions!A:F',
    })

    const rows = response.data.values || []
    console.log('📊 Total rows in sheet:', rows.length)
    
    let rowIndex = -1

    // מצא את השורה של העסקה (transactionId הוא מספר השורה)
    // השורה הראשונה היא header, אז transactionId=2 פירושו שורה 1 ב-data
    rowIndex = transactionId - 2

    if (rowIndex < 0 || rowIndex >= rows.length - 1) {
      console.log('❌ Row not found:', { transactionId, rowIndex, rowsLength: rows.length })
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // בנה את השורה החדשה
    const newRow = [
      updates.date !== undefined ? String(updates.date) : (rows[rowIndex]?.[0] || ''),
      updates.type !== undefined ? String(updates.type) : (rows[rowIndex]?.[1] || ''),
      updates.category !== undefined ? String(updates.category) : (rows[rowIndex]?.[2] || ''),
      updates.amount !== undefined ? String(updates.amount) : (rows[rowIndex]?.[3] || '0'),
      updates.description !== undefined ? String(updates.description) : (rows[rowIndex]?.[4] || ''),
      updates.paymentMethod !== undefined ? String(updates.paymentMethod) : (rows[rowIndex]?.[5] || ''),
    ]
    
    console.log('📝 New row data:', newRow)
    console.log('📍 Updating range: Transactions!A${rowIndex + 2}:F${rowIndex + 2}')

    // עדכן את השורה (rowIndex + 2 כי שורה 1 היא header וה-array מתחיל מ-0)
    const updateResponse = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Transactions!A${rowIndex + 2}:F${rowIndex + 2}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [newRow],
      },
    })
    
    console.log('✅ Update successful for row:', rowIndex + 2)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error updating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction', details: String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.accessToken) {
      console.error('❌ No access token available')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { spreadsheetId, transactionId } = await request.json()

    if (!spreadsheetId || !transactionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    })

    const sheets = google.sheets({
      version: 'v4',
      auth: oauth2Client,
    })

    // transactionId הוא מספר השורה בדיוק
    // צריך להמיר לשורה בפועל עבור batchUpdate (0-indexed)
    const rowIndex = transactionId - 2 // transactionId=2 פירושו שורה 0 בנתונים

    if (rowIndex < 0) {
      return NextResponse.json(
        { error: 'Invalid transaction ID' },
        { status: 400 }
      )
    }

    // מחק את השורה
    const batchUpdateRequest = {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: 0, // Sheet ID של 'Transactions'
              dimension: 'ROWS',
              startIndex: rowIndex + 1, // +1 כי שורה ראשונה היא header
              endIndex: rowIndex + 2,
            },
          },
        },
      ],
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: batchUpdateRequest,
    })

    console.log('✅ Delete successful for row:', rowIndex + 2)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error deleting transaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction', details: String(error) },
      { status: 500 }
    )
  }
}
