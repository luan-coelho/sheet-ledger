// Re-export for convenience
import { activityLogsTable } from './activity-log-schema'
import { billingsTable } from './billing-schema'
import { companiesTable } from './company-schema'
import { healthPlansTable } from './health-plan-schema'
import { patientsTable } from './patient-schema'
import { professionalsTable } from './professional-schema'
import { therapyPriceHistoryTable } from './therapy-price-history-schema'
import { therapiesTable } from './therapy-schema'
import { usersTable } from './user-schema'

// Export all schemas and types
export * from './activity-log-schema'
export * from './billing-schema'
export * from './company-schema'
export * from './health-plan-schema'
export * from './patient-schema'
export * from './professional-schema'
export * from './therapy-schema'
export * from './therapy-price-history-schema'
export * from './user-schema'

export const schema = {
  activityLogsTable,
  billingsTable,
  companiesTable,
  professionalsTable,
  patientsTable,
  healthPlansTable,
  usersTable,
  therapiesTable,
  therapyPriceHistoryTable,
}
