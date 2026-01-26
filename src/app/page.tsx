
'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'authenticated') {
      // אם מחובר, עבור לדשבורד
      router.push('/dashboard')
    } else {
      // אם לא מחובר, עבור לסיגנין
      router.push('/auth/signin')
    }
  }, [status, router])

  return null
}
