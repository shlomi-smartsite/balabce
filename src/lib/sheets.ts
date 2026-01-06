import { google } from 'googleapis'
import { auth } from '@/app/api/auth/[...nextauth]/route'

export async function getSheetsClient() {
  const session = await auth()
  
  if (!session?.accessToken) {
    throw new Error('No access token available')
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  oauth2Client.setCredentials({
    access_token: session.accessToken as string,
  })

  return google.sheets({ version: 'v4', auth: oauth2Client })
}

export async function getDriveClient() {
  const session = await auth()
  
  if (!session?.accessToken) {
    throw new Error('No access token available')
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  oauth2Client.setCredentials({
    access_token: session.accessToken as string,
  })

  return google.drive({ version: 'v3', auth: oauth2Client })
}

export async function findExistingBalanceSheet(userEmail: string) {
  try {
    const drive = await getDriveClient()
    
    // חפש קבצים שמתחילים ב"ניהול הכנסות והוצאות" וכוללים את המייל
    const response = await drive.files.list({
      q: `name contains 'ניהול הכנסות והוצאות' and name contains '${userEmail}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      fields: 'files(id, name, createdTime)',
      spaces: 'drive',
      orderBy: 'createdTime desc', // הקובץ האחרון שנוצר
    })

    if (response.data.files && response.data.files.length > 0) {
      console.log('Found existing spreadsheet:', response.data.files[0].name, response.data.files[0].id)
      return response.data.files[0].id || null
    }
    
    console.log('No existing spreadsheet found for:', userEmail)
    return null
  } catch (error) {
    console.error('Error finding existing sheet:', error)
    return null
  }
}

export async function createBalanceSheet(userId: string, userEmail: string) {
  // חפש קובץ קיים לפני יצירת חדש
  const existingId = await findExistingBalanceSheet(userEmail)
  if (existingId) {
    console.log('Found existing spreadsheet:', existingId)
    return existingId
  }

  const sheets = await getSheetsClient()
  
  // Create new spreadsheet
  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: `ניהול הכנסות והוצאות - ${userEmail}`,
      },
      sheets: [
        {
          properties: {
            title: 'Transactions',
            gridProperties: { frozenRowCount: 1 },
          },
        },
        {
          properties: {
            title: 'Categories',
            gridProperties: { frozenRowCount: 1 },
          },
        },
        {
          properties: {
            title: 'Settings',
          },
        },
      ],
    },
  })

  const spreadsheetId = spreadsheet.data.spreadsheetId!

  // Add headers and initial data
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      data: [
        {
          range: 'Transactions!A1:F1',
          values: [['תאריך', 'סוג', 'קטגוריה', 'סכום', 'תיאור', 'אמצעי תשלום']],
        },
        {
          range: 'Categories!A1:B1',
          values: [['קטגוריה', 'סוג']],
        },
        {
          range: 'Categories!A2:B10',
          values: [
            ['משכורת', 'הכנסה'],
            ['פרילנס', 'הכנסה'],
            ['אחר', 'הכנסה'],
            ['מזון', 'הוצאה'],
            ['תחבורה', 'הוצאה'],
            ['בילויים', 'הוצאה'],
            ['קניות', 'הוצאה'],
            ['חשבונות', 'הוצאה'],
            ['אחר', 'הוצאה'],
          ],
        },
        {
          range: 'Settings!A1:B5',
          values: [
            ['מפתח', 'ערך'],
            ['מטבע', '₪'],
            ['שפה', 'he'],
            ['תאריך_יצירה', new Date().toISOString()],
            ['גרסה', '1.0.0'],
          ],
        },
      ],
      valueInputOption: 'USER_ENTERED',
    },
  })

  return spreadsheetId
}

export async function getTransactions(spreadsheetId: string) {
  const sheets = await getSheetsClient()
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Transactions!A2:F',
  })

  const rows = response.data.values || []
  
  return rows.map((row, index) => ({
    id: index + 2, // Row number in sheet
    date: row[0] || '',
    type: row[1] || '',
    category: row[2] || '',
    amount: parseFloat(row[3]) || 0,
    description: row[4] || '',
    paymentMethod: row[5] || '',
  }))
}

export async function addTransaction(spreadsheetId: string, transaction: {
  date: string
  type: string
  category: string
  amount: number
  description: string
  paymentMethod: string
}) {
  const sheets = await getSheetsClient()
  
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Transactions!A:F',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        transaction.date,
        transaction.type,
        transaction.category,
        transaction.amount,
        transaction.description,
        transaction.paymentMethod,
      ]],
    },
  })
}

export async function getCategories(spreadsheetId: string) {
  const sheets = await getSheetsClient()
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Categories!A2:B',
  })

  const rows = response.data.values || []
  
  return rows.map((row) => ({
    name: row[0] || '',
    type: row[1] || '',
  }))
}

export async function addCategory(spreadsheetId: string, category: {
  name: string
  type: string
}) {
  const sheets = await getSheetsClient()
  
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Categories!A:B',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[category.name, category.type]],
    },
  })
}

export async function deleteCategory(spreadsheetId: string, categoryName: string, categoryType: string) {
  const sheets = await getSheetsClient()
  
  // Get all categories
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Categories!A2:B',
  })

  const rows = response.data.values || []
  
  // Find the row to delete
  const rowIndex = rows.findIndex(
    (row) => row[0] === categoryName && row[1] === categoryType
  )
  
  if (rowIndex === -1) {
    throw new Error('Category not found')
  }

  // Delete the row (add 2 because: 1 for header, 1 for 0-based to 1-based)
  const sheetId = await getSheetId(spreadsheetId, 'Categories')
  
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex + 1, // +1 for header
              endIndex: rowIndex + 2,
            },
          },
        },
      ],
    },
  })
}

async function getSheetId(spreadsheetId: string, sheetName: string): Promise<number> {
  const sheets = await getSheetsClient()
  
  const response = await sheets.spreadsheets.get({
    spreadsheetId,
  })

  const sheet = response.data.sheets?.find(
    (s) => s.properties?.title === sheetName
  )

  if (!sheet?.properties?.sheetId) {
    throw new Error(`Sheet ${sheetName} not found`)
  }

  return sheet.properties.sheetId
}

export async function reorderCategories(
  spreadsheetId: string,
  categories: Array<{ name: string; type: string }>,
  type: string
) {
  const sheets = await getSheetsClient()
  
  // Get all current categories
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Categories!A2:B',
  })

  const allRows = response.data.values || []
  
  // Separate by type
  const otherTypeCategories = allRows.filter(row => row[1] !== type)
  const reorderedCategories = categories.map(c => [c.name, c.type])
  
  // Combine: other type first, then reordered type
  const newRows = type === 'הכנסה' 
    ? [...reorderedCategories, ...otherTypeCategories]
    : [...otherTypeCategories, ...reorderedCategories]
  
  // Clear and rewrite all categories
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: 'Categories!A2:B',
  })
  
  if (newRows.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Categories!A2:B',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: newRows,
      },
    })
  }
}
