# Balance - ניהול הכנסות והוצאות

אפליקציה מודרנית לניהול פיננסי אישי עם אחסון מלא בשליטת המשתמש.

## ✨ תכונות עיקריות

- **פרטיות מלאה** - כל הנתונים נשמרים ב-Google Sheets האישי שלך
- **בעלות על הדאטה** - אין שמירה של מידע פיננסי בשרת
- **ממשק מודרני** - עיצוב מינימלי וחד עם צבעים ברורים
- **ניתוח מתקדם** - גרפים, סטטיסטיקות ומעקב אחר יתרה
- **סנכרון אוטומטי** - עבודה חלקה עם Google Sheets

## 🚀 התחלת עבודה

### דרישות מקדימות

- Node.js 18+ 
- חשבון Google
- Google Cloud Project עם Sheets API מופעל

### הגדרת Google OAuth

1. עבור ל-[Google Cloud Console](https://console.cloud.google.com)
2. צור פרויקט חדש או בחר קיים
3. הפעל את Google Sheets API
4. צור OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. העתק את Client ID ו-Client Secret

### התקנה

```bash
# התקן תלויות
npm install

# העתק את קובץ הסביבה
cp .env.example .env.local

# ערוך את .env.local והוסף את ה-credentials שלך
```

### הגדרת משתני סביבה

ערוך את `.env.local`:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_random_secret_here
```

ליצירת `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### הרצת האפליקציה

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
