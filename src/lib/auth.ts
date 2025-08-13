import { eq } from 'drizzle-orm'
import NextAuth from 'next-auth'
import { headers } from 'next/headers'

import { User, usersTable } from '@/app/db/schemas'

import { db } from '../app/db'
import { logSignInServer } from './auth-server-logger'
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

        // Registrar log de login bem-sucedido APENAS aqui, no momento do login
        try {
          const headersList = await headers()
          const requestInfo = {
            ip: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown',
            userAgent: headersList.get('user-agent') || 'unknown',
          }

          await logSignInServer(existingUser.id, existingUser.email, requestInfo)
        } catch (error) {
          // Não interromper o login por erro de log
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
