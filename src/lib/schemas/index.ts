// Export all schemas and types
export * from './professional-schema'
export * from './patient-schema'
export * from './guardian-schema'
export * from './health-plan-schema'
export * from './user-schema'

// Re-export for convenience
import { professionals } from './professional-schema'
import { patients } from './patient-schema'
import { guardians } from './guardian-schema'
import { healthPlans } from './health-plan-schema'
import { users, accounts, sessions, verificationTokens } from './user-schema'

export const schema = {
  professionals,
  patients,
  guardians,
  healthPlans,
  users,
  accounts,
  sessions,
  verificationTokens,
}
