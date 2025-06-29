import { eq } from 'drizzle-orm'
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

import { User, usersTable } from '@/app/db/schemas'

import { routes } from '@/lib/routes'

import { db } from '../app/db'
import { logServerSignIn } from './auth-logger'

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: false,
  trustHost: true,
  providers: [
    Google({
      profile(profile) {
        return { ...profile }
      },
      authorization: {
        params: {
          prompt: 'select_account',
        },
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 1 * 24 * 60 * 60, // 1 dia
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
        const [existingUser]: User[] | [] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, user.email || ''))
          .limit(1)
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

        // Atribui os dados do banco de dados ao usuário
        user.id = existingUser.id

        // Registrar log de login
        try {
          await logServerSignIn(existingUser.id, existingUser.email)
        } catch (error) {
          console.error('Erro ao registrar log de login:', error)
        }

        return true
      }
      return false
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update' && session?.user) {
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
