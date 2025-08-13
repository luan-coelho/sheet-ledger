'use server'

import { and, desc, eq, gt } from 'drizzle-orm'

import { db } from '@/app/db'
import { ActivityActions, activityLogsTable } from '@/app/db/schemas/activity-log-schema'

import { logActivityServer } from '@/services/activity-log-server'

// Registrar login no servidor com verificação de duplicatas
export async function logSignInServer(
  userId: string,
  userEmail: string,
  requestInfo?: { ip?: string; userAgent?: string },
) {
  try {
    // Verificar se já existe um log de SIGN_IN para o mesmo usuário nos últimos 30 segundos
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000)

    const recentSignInLog = await db
      .select()
      .from(activityLogsTable)
      .where(
        and(
          eq(activityLogsTable.userId, userId),
          eq(activityLogsTable.action, ActivityActions.SIGN_IN),
          gt(activityLogsTable.createdAt, thirtySecondsAgo),
        ),
      )
      .orderBy(desc(activityLogsTable.createdAt))
      .limit(1)

    // Se já existe um log de login recente, não criar um novo
    if (recentSignInLog.length > 0) {
      console.log(`Log de login duplicado evitado para usuário ${userEmail}`)
      return
    }

    // Se não há log recente, registrar o novo login
    await logActivityServer(
      userId,
      ActivityActions.SIGN_IN,
      `Usuário ${userEmail} fez login no sistema`,
      { userEmail },
      requestInfo,
    )
  } catch (error) {
    console.error('Erro ao registrar log de login:', error)
    // Em caso de erro na verificação, ainda tentar registrar o log
    // para não perder o evento, mas sem verificação de duplicata
    try {
      await logActivityServer(
        userId,
        ActivityActions.SIGN_IN,
        `Usuário ${userEmail} fez login no sistema`,
        { userEmail },
        requestInfo,
      )
    } catch (fallbackError) {
      console.error('Erro ao registrar log de login (fallback):', fallbackError)
    }
  }
}

// Registrar logout no servidor
export async function logSignOutServer(
  userId: string,
  userEmail: string,
  requestInfo?: { ip?: string; userAgent?: string },
) {
  await logActivityServer(
    userId,
    ActivityActions.SIGN_OUT,
    `Usuário ${userEmail} fez logout do sistema`,
    { userEmail },
    requestInfo,
  )
}
