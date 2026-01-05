'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, Shield, TrendingUp, Lock } from 'lucide-react'

export default function SignIn() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Balance
            </h1>
            <p className="text-xl text-slate-600">
              ניהול הכנסות והוצאות חכם ופרטי
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">פרטיות מלאה</h3>
                <p className="text-sm text-slate-600">
                  כל הנתונים שלך נשמרים רק ב-Google Sheets האישי שלך
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Wallet className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">בעלות מלאה</h3>
                <p className="text-sm text-slate-600">
                  אתה הבעלים של הדאטה - תמיד נגיש ובשליטתך
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">ניתוח מתקדם</h3>
                <p className="text-sm text-slate-600">
                  גרפים, סטטיסטיקות ומעקב אוטומטי אחר התקציב
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Lock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">אפס נתונים בשרת</h3>
                <p className="text-sm text-slate-600">
                  אנחנו לא שומרים את המידע הפיננסי שלך - רק מתווכים
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card className="shadow-2xl border-2">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl">התחבר כדי להתחיל</CardTitle>
            <CardDescription>
              התחבר עם חשבון Google שלך כדי ליצור את ה-Spreadsheet האישי
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              size="lg"
              className="w-full text-base h-12"
            >
              <svg className="ml-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              התחבר עם Google
            </Button>

            <div className="text-xs text-center text-slate-500 space-y-1">
              <p>בהתחברות, אתה מאשר גישה ל:</p>
              <p>• יצירת Google Sheets חדש</p>
              <p>• קריאה וכתיבה לקובץ זה בלבד</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
