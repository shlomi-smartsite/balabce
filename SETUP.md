# Balance - הוראות הפעלה

## ✅ מה נבנה

אפליקציה מלאה לניהול הכנסות והוצאות עם:

### תכונות שהוטמעו:
- ✅ התחברות עם Google OAuth
- ✅ יצירה אוטומטית של Google Sheets
- ✅ הוספת עסקאות (הכנסות/הוצאות)
- ✅ לוח בקרה עם סטטיסטיקות
- ✅ גרפים חכמים (PieCharts לפי קטגוריה)
- ✅ רשימת עסקאות אחרונות
- ✅ סנכרון עם Google Sheets
- ✅ עיצוב מינימלי ומודרני RTL
- ✅ ניהול קטגוריות
- ✅ State management עם Zustand

## 🚀 איך להפעיל

### שלב 1: הגדרת Google Cloud

1. עבור ל-[Google Cloud Console](https://console.cloud.google.com)
2. לחץ על "Create Project" או בחר פרויקט קיים
3. עבור ל-**APIs & Services → Library**
4. חפש "Google Sheets API" והפעל אותו
5. חפש "Google Drive API" והפעל אותו

### שלב 2: יצירת OAuth Credentials

1. עבור ל-**APIs & Services → Credentials**
2. לחץ **Create Credentials → OAuth client ID**
3. אם מתבקש, הגדר את ה-OAuth consent screen:
   - User Type: External
   - App name: Balance
   - User support email: האימייל שלך
   - Developer contact: האימייל שלך
   - Save
4. בחר Application type: **Web application**
5. שם: Balance App
6. **Authorized redirect URIs**, הוסף:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. לחץ **Create**
8. **העתק את Client ID ו-Client Secret**

### שלב 3: הגדרת קובץ הסביבה

1. פתח את `.env.local` בעורך טקסט
2. הדבק את ה-credentials:
   ```env
   GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
   GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-here
   ```

3. ליצירת `NEXTAUTH_SECRET`, הרץ:
   ```bash
   openssl rand -base64 32
   ```
   או השתמש באתר: https://generate-secret.vercel.app/32

### שלב 4: הפעלת האפליקציה

השרת כבר רץ! פתח בדפדפן:
**http://localhost:3000**

## 📱 איך להשתמש

1. **לחץ על "התחבר עם Google"**
2. אשר הרשאות (Sheets + Drive)
3. האפליקציה תיצור אוטומטית Google Sheets בשבילך
4. **הוסף עסקאות** עם הכפתור הכחול
5. **סנכרן** עם הכפתור למעלה
6. **פתח ב-Sheets** כדי לראות את הדאטה הגולמי

## 🎨 עיצוב

- **צבעים חדים ומודרניים**: כחול, ירוק, אדום
- **גרדיאנטים עדינים** על כפתורים וכרטיסים
- **צללים דרמטיים** למראה מודרני
- **אנימציות חלקות** על hover
- **RTL מלא** לתמיכה בעברית
- **פונט Heebo** לטקסט עברי קריא

## 📊 מבנה ה-Google Sheets שנוצר

### Sheet 1: Transactions
| תאריך | סוג | קטגוריה | סכום | תיאור | אמצעי תשלום |
|-------|-----|----------|------|--------|-------------|

### Sheet 2: Categories
קטגוריות מוגדרות מראש להכנסות והוצאות

### Sheet 3: Settings
מטבע, שפה, גרסה

## 🛠️ טכנולוגיות

- Next.js 15 (App Router + Turbopack)
- TypeScript
- Tailwind CSS
- NextAuth.js v5
- Google Sheets API
- Zustand (state)
- Recharts (גרפים)
- Radix UI (קומפוננטות)

## ⚠️ פתרון בעיות נפוצות

### "Invalid client" בהתחברות
- ודא שהוספת את ה-redirect URI הנכון
- בדוק שה-CLIENT_ID תואם

### "Access denied" ל-Sheets
- ודא שהפעלת Google Sheets API ו-Drive API
- בדוק את ה-scopes ב-OAuth consent screen

### השרת לא עולה
```bash
npm install
npm run dev
```

## 🔜 שיפורים עתידיים

רעיונות להמשך:
- תקציב חודשי + התראות
- עסקאות קבועות (Recurring)
- תגיות (Tags)
- ייבוא מ-CSV
- ייצוא ל-PDF
- מצב Offline עם IndexedDB
- PWA support

---

**האפליקציה מוכנה לשימוש!** 🎉

כל השאלות? פתח issue או שאל אותי ישירות.
