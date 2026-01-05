import { auth } from '@/app/api/auth/[...nextauth]/route'

export default auth((req) => {
  // No additional logic needed - just protect routes
})

export const config = {
  matcher: ['/dashboard/:path*', '/api/sheets/:path*'],
}
