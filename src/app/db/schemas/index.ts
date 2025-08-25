// Re-export for convenience
import { activityLogsTable } from './activity-log-schema'
import { companiesTable } from './company-schema'
import { googleDriveConfigTable } from './google-drive-config-schema'
import { guardiansTable } from './guardian-schema'
import { healthPlansTable } from './health-plan-schema'
import { patientsTable } from './patient-schema'
import { professionalsTable } from './professional-schema'
import { therapiesTable } from './therapy-schema'
import { usersTable } from './user-schema'

// Export all schemas and types
export * from './activity-log-schema'
export * from './company-schema'
export * from './professional-schema'
export * from './patient-schema'
export * from './guardian-schema'
export * from './health-plan-schema'
export * from './user-schema'
export * from './google-drive-config-schema'
export * from './therapy-schema'
export * from './relations'

export const schema = {
  activityLogsTable,
  companiesTable,
  professionalsTable,
  patientsTable,
  guardiansTable,
  healthPlansTable,
  usersTable,
  googleDriveConfigTable,
  therapiesTable,
}
