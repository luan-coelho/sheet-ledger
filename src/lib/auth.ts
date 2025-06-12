import { db } from '@/lib/db'
import { routes } from '@/lib/routes'
import { eq } from 'drizzle-orm'
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { users } from './schemas'

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true,
  trustHost: true,
  providers: [
    Google({
      profile(profile) {
        return { ...profile }
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  pages: {
    signIn: routes.frontend.auth.login,
    signOut: routes.frontend.auth.login,
    newUser: routes.frontend.auth.login,
    error: routes.frontend.auth.login,
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        // Verifica se o usuário existe no banco de dados
        const existingUser = await db
          .select()
          .from(users)
          .where({
            email: user.email ?? '',
          })

        // Se o usuário não existir no sistema, bloqueia o acesso
        if (!existingUser) {
          throw new Error(
            'Você não está cadastrado no sistema. Entre em contato com um administrador para solicitar acesso.',
          )
        }

        // Verifica se o usuário está ativo
        if (!existingUser.active) {
          throw new Error(
            'Seu acesso foi revogado. Entre em contato com um administrador se acredita que isso é um erro.',
          )
        }

        // Atualiza informações do usuário caso necessário
        if ((!existingUser.name && user.name) || (!existingUser.image && user.image)) {
          await db
            .update(tableUsers)
            .set({
              name: existingUser.name || user.name,
              image: existingUser.image || user.image,
              updatedAt: new Date(),
            })
            .where(eq(tableUsers.id, existingUser.id))
        }

        // Atribui os dados do banco de dados ao usuário
        user.id = existingUser.id
        return true
      }
      return false
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update' && session?.user) {
        // Se a sessão for atualizada, atualiza também o token
        token.role = session.user.role
        return token
      }

      // Passa as informações do usuário para o token durante o login
      if (user) {
        token.id = user.id
      }

      return token
    },
    async session({ session, token }) {
      // Passa os dados do token para a sessão
      if (token) {
        if (token.id) session.user.id = token.id as string
      }
      return session
    },
  },
})
