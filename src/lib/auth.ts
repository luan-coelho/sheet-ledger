import { eq } from 'drizzle-orm'
import NextAuth from 'next-auth'

import { User, usersTable } from '@/app/db/schemas'

import { db } from '../app/db'
import authConfig from './auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
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
