export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">מדיניות פרטיות</h1>
        
        <div className="space-y-6 text-gray-800">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">מבוא</h2>
            <p className="leading-relaxed">
              Balance היא אפליקציה לניהול הכנסות והוצאות אישיות. אנו מחויבים להגן על פרטיותך 
              ולספק לך שקיפות מלאה לגבי האופן שבו אנו משתמשים במידע שלך.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">איזה מידע אנו אוספים</h2>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>כתובת המייל שלך (מ-Google OAuth)</li>
              <li>שם המשתמש שלך (מ-Google OAuth)</li>
              <li>גישה ל-Google Sheets שלך (רק לקבצים שהאפליקציה יצרה)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">איך אנו משתמשים במידע</h2>
            <p className="leading-relaxed mb-3">
              <strong>חשוב: אנו לא שומרים שום מידע כספי בשרתים שלנו.</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>כל הנתונים הכספיים נשמרים אך ורק ב-Google Sheets שלך</li>
              <li>אנו משתמשים במייל שלך רק לזיהוי ואימות</li>
              <li>אנו לא משתפים את המידע שלך עם צדדים שלישיים</li>
              <li>אנו לא מוכרים את המידע שלך</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">אחסון נתונים</h2>
            <p className="leading-relaxed">
              כל המידע הכספי שלך (עסקאות, קטגוריות, סכומים) נשמר ב-Google Drive שלך ב-Google Sheets.
              האפליקציה פועלת כממשק לקריאה וכתיבה של הנתונים האלה בלבד.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">הרשאות Google</h2>
            <p className="leading-relaxed mb-3">האפליקציה מבקשת את ההרשאות הבאות:</p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li><strong>Google Sheets:</strong> ליצירה וניהול של קובץ ה-Spreadsheet שלך</li>
              <li><strong>Google Drive:</strong> לשמירת הקובץ ב-Drive שלך</li>
              <li><strong>Email & Profile:</strong> לזיהוי המשתמש</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">מחיקת מידע</h2>
            <p className="leading-relaxed">
              אתה יכול למחוק את כל המידע שלך בכל עת על ידי מחיקת קובץ ה-Google Sheets מה-Drive שלך.
              אין לנו גישה למידע שלך לאחר שאתה מתנתק מהאפליקציה.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">שינויים במדיניות</h2>
            <p className="leading-relaxed">
              אנו שומרים לעצמנו את הזכות לעדכן מדיניות זו מעת לעת. 
              שינויים מהותיים יפורסמו באתר.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">יצירת קשר</h2>
            <p className="leading-relaxed">
              לשאלות או בקשות בנוגע לפרטיות, ניתן ליצור קשר בכתובת:
              <br />
              <a href="mailto:ah.shlomi7@gmail.com" className="text-blue-600 hover:underline font-semibold">
                ah.shlomi7@gmail.com
              </a>
            </p>
          </section>

          <section className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              עודכן לאחרונה: {new Date().toLocaleDateString('he-IL', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <a 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← חזור לאפליקציה
          </a>
        </div>
      </div>
    </div>
  )
}
