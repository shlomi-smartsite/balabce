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

export async function createBalanceSheet(userId: string, userEmail: string) {
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
