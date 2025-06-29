// Re-export for convenience
import { googleDriveConfigTable } from './google-drive-config-schema'
import { guardiansTable } from './guardian-schema'
import { healthPlansTable } from './health-plan-schema'
import { patientsTable } from './patient-schema'
import { professionalsTable } from './professional-schema'
import { usersTable } from './user-schema'

// Export all schemas and types
export * from './professional-schema'
export * from './patient-schema'
export * from './guardian-schema'
export * from './health-plan-schema'
export * from './user-schema'
export * from './google-drive-config-schema'

export const schema = {
  professionalsTable,
  patientsTable,
  guardiansTable,
  healthPlansTable,
  usersTable,
  googleDriveConfigTable,
}
