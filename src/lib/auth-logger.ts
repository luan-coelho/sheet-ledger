import { NextRequest } from 'next/server'

import { activityLogger } from './activity-logger'

// Função para registrar login do servidor
export async function logServerSignIn(userId: string, userEmail: string, request?: NextRequest) {
  try {
    const logData = {
      ip: getClientIP(request),
      userAgent: request?.headers.get('user-agent') || 'unknown',
    }

    // Fazer requisição direta para API de logs do servidor
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/activity-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        action: 'SIGN_IN',
        description: `Usuário ${userEmail} fez login no sistema`,
        ipAddress: logData.ip,
        userAgent: logData.userAgent,
        metadata: JSON.stringify({ userEmail }),
      }),
    })

    if (!response.ok) {
      console.error('Erro ao registrar log de login:', await response.text())
    }
  } catch (error) {
    console.error('Erro ao registrar log de login:', error)
  }
}

// Função para registrar logout do servidor
export async function logServerSignOut(userId: string, userEmail: string, request?: NextRequest) {
  try {
    const logData = {
      ip: getClientIP(request),
      userAgent: request?.headers.get('user-agent') || 'unknown',
    }

    // Fazer requisição direta para API de logs do servidor
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/activity-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        action: 'SIGN_OUT',
        description: `Usuário ${userEmail} fez logout do sistema`,
        ipAddress: logData.ip,
        userAgent: logData.userAgent,
        metadata: JSON.stringify({ userEmail }),
      }),
    })

    if (!response.ok) {
      console.error('Erro ao registrar log de logout:', await response.text())
    }
  } catch (error) {
    console.error('Erro ao registrar log de logout:', error)
  }
}

// Função utilitária para obter IP do cliente
function getClientIP(request?: NextRequest): string {
  if (!request) return 'unknown'

  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const clientIp = forwarded?.split(',')[0] || realIp || 'unknown'
  return clientIp
}

// Hook personalizado para registrar login no cliente
export function useAuthLogger() {
  const handleSignIn = async (userId: string, userEmail: string) => {
    await activityLogger.logSignIn(userId, userEmail)
  }

  const handleSignOut = async (userId: string, userEmail: string) => {
    await activityLogger.logSignOut(userId, userEmail)
  }

  return {
    logSignIn: handleSignIn,
    logSignOut: handleSignOut,
  }
}
