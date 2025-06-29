import { ActivityAction, ActivityActions } from '@/app/db/schemas/activity-log-schema'

import { logActivity } from '@/services/activity-log-service'

// Classe singleton para gerenciar logs de atividades
export class ActivityLogger {
  private static instance: ActivityLogger
  private currentUserId: string | null = null

  private constructor() {}

  static getInstance(): ActivityLogger {
    if (!ActivityLogger.instance) {
      ActivityLogger.instance = new ActivityLogger()
    }
    return ActivityLogger.instance
  }

  // Definir o usuário atual para logs automáticos
  setCurrentUserId(userId: string | null) {
    this.currentUserId = userId
  }

  // Registrar login
  async logSignIn(userId: string, userEmail: string) {
    await logActivity(userId, ActivityActions.SIGN_IN, `Usuário ${userEmail} fez login no sistema`, { userEmail })
  }

  // Registrar logout
  async logSignOut(userId: string, userEmail: string) {
    await logActivity(userId, ActivityActions.SIGN_OUT, `Usuário ${userEmail} fez logout do sistema`, { userEmail })
  }

  // Registrar criação de usuário
  async logUserCreated(actorUserId: string, newUserName: string, newUserEmail: string) {
    await logActivity(actorUserId, ActivityActions.USER_CREATED, `Criou o usuário ${newUserName} (${newUserEmail})`, {
      newUserName,
      newUserEmail,
    })
  }

  // Registrar atualização de usuário
  async logUserUpdated(
    actorUserId: string,
    targetUserName: string,
    targetUserEmail: string,
    changes: Record<string, unknown>,
  ) {
    await logActivity(
      actorUserId,
      ActivityActions.USER_UPDATED,
      `Atualizou dados do usuário ${targetUserName} (${targetUserEmail})`,
      { targetUserName, targetUserEmail, changes },
    )
  }

  // Registrar ativação de usuário
  async logUserActivated(actorUserId: string, targetUserName: string, targetUserEmail: string) {
    await logActivity(
      actorUserId,
      ActivityActions.USER_ACTIVATED,
      `Ativou o usuário ${targetUserName} (${targetUserEmail})`,
      { targetUserName, targetUserEmail },
    )
  }

  // Registrar desativação de usuário
  async logUserDeactivated(actorUserId: string, targetUserName: string, targetUserEmail: string) {
    await logActivity(
      actorUserId,
      ActivityActions.USER_DEACTIVATED,
      `Desativou o usuário ${targetUserName} (${targetUserEmail})`,
      { targetUserName, targetUserEmail },
    )
  }

  // Registrar concessão de permissão
  async logPermissionGranted(actorUserId: string, targetUserName: string, permission: string) {
    await logActivity(
      actorUserId,
      ActivityActions.PERMISSION_GRANTED,
      `Concedeu permissão "${permission}" para ${targetUserName}`,
      { targetUserName, permission },
    )
  }

  // Registrar revogação de permissão
  async logPermissionRevoked(actorUserId: string, targetUserName: string, permission: string) {
    await logActivity(
      actorUserId,
      ActivityActions.PERMISSION_REVOKED,
      `Revogou permissão "${permission}" de ${targetUserName}`,
      { targetUserName, permission },
    )
  }

  // Registrar geração de planilha
  async logSpreadsheetGenerated(userId: string, fileName: string, type: string) {
    await logActivity(userId, ActivityActions.SPREADSHEET_GENERATED, `Gerou planilha "${fileName}" do tipo ${type}`, {
      fileName,
      type,
    })
  }

  // Registrar conexão com Google Drive
  async logGoogleDriveConnected(userId: string) {
    await logActivity(userId, ActivityActions.GOOGLE_DRIVE_CONNECTED, 'Conectou conta com Google Drive', {})
  }

  // Registrar criação de paciente
  async logPatientCreated(userId: string, patientName: string) {
    await logActivity(userId, ActivityActions.PATIENT_CREATED, `Criou o paciente ${patientName}`, { patientName })
  }

  // Registrar atualização de paciente
  async logPatientUpdated(userId: string, patientName: string, changes: Record<string, unknown>) {
    await logActivity(userId, ActivityActions.PATIENT_UPDATED, `Atualizou dados do paciente ${patientName}`, {
      patientName,
      changes,
    })
  }

  // Registrar criação de profissional
  async logProfessionalCreated(userId: string, professionalName: string) {
    await logActivity(userId, ActivityActions.PROFESSIONAL_CREATED, `Criou o profissional ${professionalName}`, {
      professionalName,
    })
  }

  // Registrar atualização de profissional
  async logProfessionalUpdated(userId: string, professionalName: string, changes: Record<string, unknown>) {
    await logActivity(
      userId,
      ActivityActions.PROFESSIONAL_UPDATED,
      `Atualizou dados do profissional ${professionalName}`,
      { professionalName, changes },
    )
  }

  // Registrar criação de responsável
  async logGuardianCreated(userId: string, guardianName: string) {
    await logActivity(userId, ActivityActions.GUARDIAN_CREATED, `Criou o responsável ${guardianName}`, { guardianName })
  }

  // Registrar atualização de responsável
  async logGuardianUpdated(userId: string, guardianName: string, changes: Record<string, unknown>) {
    await logActivity(userId, ActivityActions.GUARDIAN_UPDATED, `Atualizou dados do responsável ${guardianName}`, {
      guardianName,
      changes,
    })
  }

  // Registrar criação de plano de saúde
  async logHealthPlanCreated(userId: string, healthPlanName: string) {
    await logActivity(userId, ActivityActions.HEALTH_PLAN_CREATED, `Criou o plano de saúde ${healthPlanName}`, {
      healthPlanName,
    })
  }

  // Registrar atualização de plano de saúde
  async logHealthPlanUpdated(userId: string, healthPlanName: string, changes: Record<string, unknown>) {
    await logActivity(
      userId,
      ActivityActions.HEALTH_PLAN_UPDATED,
      `Atualizou dados do plano de saúde ${healthPlanName}`,
      { healthPlanName, changes },
    )
  }

  // Método genérico para registrar qualquer atividade
  async log(userId: string, action: ActivityAction, description: string, metadata?: Record<string, unknown>) {
    await logActivity(userId, action, description, metadata)
  }
}

// Exportar instância singleton
export const activityLogger = ActivityLogger.getInstance()
