import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: { signIn: '/login' },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/carreras/:path*',
    '/conductores/:path*',
    '/usuarios/:path*',
    '/incidentes/:path*',
    '/pagos/:path*',
    '/ajustes/:path*',
  ],
}
