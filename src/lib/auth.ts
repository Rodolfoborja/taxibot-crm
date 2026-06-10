import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from './prisma'

/**
 * Configuración de NextAuth.
 * Autenticación por credenciales (email + password) contra el modelo AdminPMA.
 * Estrategia JWT — el rol PMA viaja en el token.
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const admin = await prisma.adminPMA.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        })
        if (!admin || !admin.activo) return null

        const ok = await bcrypt.compare(credentials.password, admin.password)
        if (!ok) return null

        return {
          id: admin.id,
          email: admin.email,
          name: admin.nombre,
          rol: admin.rol,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as unknown as { id: string }).id
        token.rol = (user as unknown as { rol: string }).rol
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as { id?: string }).id = token.id as string
        ;(session.user as { rol?: string }).rol = token.rol as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
