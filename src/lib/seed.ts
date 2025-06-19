import { db } from '../app/db'
import {
  professionalsTable,
  patientsTable,
  guardiansTable,
  healthPlansTable,
  type NewProfessional,
  type NewPatient,
  type NewGuardian,
  type NewHealthPlan,
} from '../app/db/schemas'
import { eq, sql } from 'drizzle-orm'

// Sample data for seeding
const samplePatients: NewPatient[] = [
  { name: 'Ana Silva Santos' },
  { name: 'Carlos Eduardo Oliveira' },
  { name: 'Maria José Ferreira' },
  { name: 'João Pedro Costa' },
  { name: 'Fernanda Lima Souza' },
  { name: 'Roberto Carlos Almeida' },
  { name: 'Juliana Mendes Rocha' },
  { name: 'Pedro Henrique Barbosa' },
]

const sampleProfessionals: NewProfessional[] = [
  { name: 'Dr. Ricardo Cardoso - Cardiologista' },
  { name: 'Dra. Patrícia Mendes - Pediatra' },
  { name: 'Dr. Fernando Santos - Ortopedista' },
  { name: 'Dra. Luciana Oliveira - Ginecologista' },
  { name: 'Dr. Marcos Silva - Neurologista' },
  { name: 'Dra. Camila Costa - Dermatologista' },
]

const sampleGuardians: NewGuardian[] = [
  { name: 'Sandra Regina Santos' },
  { name: 'José Carlos Oliveira' },
  { name: 'Márcia Fernanda Lima' },
  { name: 'Antonio Silva Costa' },
]

const sampleHealthPlans: NewHealthPlan[] = [
  { name: 'Unimed Nacional' },
  { name: 'Bradesco Saúde' },
  { name: 'SulAmérica Saúde' },
  { name: 'Amil Assistência Médica' },
  { name: 'NotreDame Intermédica' },
]

/**
 * Seeds the database with sample data for all entities
 * Can be run multiple times safely - checks for existing records
 */
export async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n')

  try {
    // Test database connection first
    await db.execute(sql`SELECT 1`)
    console.log('✅ Database connection verified')

    // Seed Patients
    console.log('\n👥 Seeding patients...')
    let patientsCreated = 0
    for (const patient of samplePatients) {
      const existing = await db.select().from(patientsTable).where(eq(patientsTable.name, patient.name)).limit(1)

      if (existing.length === 0) {
        await db.insert(patientsTable).values(patient)
        patientsCreated++
        console.log(`  ✓ Created patient: ${patient.name}`)
      } else {
        console.log(`  ⚠ Patient already exists: ${patient.name}`)
      }
    }

    // Seed Professionals
    console.log('\n👨‍⚕️ Seeding professionals...')
    let professionalsCreated = 0
    for (const professional of sampleProfessionals) {
      const existing = await db
        .select()
        .from(professionalsTable)
        .where(eq(professionalsTable.name, professional.name))
        .limit(1)

      if (existing.length === 0) {
        await db.insert(professionalsTable).values(professional)
        professionalsCreated++
        console.log(`  ✓ Created professional: ${professional.name}`)
      } else {
        console.log(`  ⚠ Professional already exists: ${professional.name}`)
      }
    }

    // Seed Guardians
    console.log('\n👨‍👩‍👧‍👦 Seeding guardians...')
    let guardiansCreated = 0
    for (const guardian of sampleGuardians) {
      const existing = await db.select().from(guardiansTable).where(eq(guardiansTable.name, guardian.name)).limit(1)

      if (existing.length === 0) {
        await db.insert(guardiansTable).values(guardian)
        guardiansCreated++
        console.log(`  ✓ Created guardian: ${guardian.name}`)
      } else {
        console.log(`  ⚠ Guardian already exists: ${guardian.name}`)
      }
    }

    // Seed Health Plans
    console.log('\n🏥 Seeding health plans...')
    let healthPlansCreated = 0
    for (const healthPlan of sampleHealthPlans) {
      const existing = await db
        .select()
        .from(healthPlansTable)
        .where(eq(healthPlansTable.name, healthPlan.name))
        .limit(1)

      if (existing.length === 0) {
        await db.insert(healthPlansTable).values(healthPlan)
        healthPlansCreated++
        console.log(`  ✓ Created health plan: ${healthPlan.name}`)
      } else {
        console.log(`  ⚠ Health plan already exists: ${healthPlan.name}`)
      }
    }

    // Summary
    console.log('\n📊 Seeding Summary:')
    console.log(`  Patients created: ${patientsCreated}/${samplePatients.length}`)
    console.log(`  Professionals created: ${professionalsCreated}/${sampleProfessionals.length}`)
    console.log(`  Guardians created: ${guardiansCreated}/${sampleGuardians.length}`)
    console.log(`  Health plans created: ${healthPlansCreated}/${sampleHealthPlans.length}`)

    const totalCreated = patientsCreated + professionalsCreated + guardiansCreated + healthPlansCreated
    console.log(`\n✅ Database seeding completed! Created ${totalCreated} new records.`)

    return {
      success: true,
      created: {
        patients: patientsCreated,
        professionals: professionalsCreated,
        guardians: guardiansCreated,
        healthPlans: healthPlansCreated,
        total: totalCreated,
      },
    }
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Clears all sample data from the database
 * Use with caution - this will delete data!
 */
export async function clearSeedData() {
  console.log('🧹 Clearing seed data...\n')

  try {
    // Delete in reverse order to avoid any potential issues
    const healthPlanNames = sampleHealthPlans.map(hp => hp.name)
    const guardianNames = sampleGuardians.map(g => g.name)
    const professionalNames = sampleProfessionals.map(p => p.name)
    const patientNames = samplePatients.map(p => p.name)

    // Clear health plans
    for (const name of healthPlanNames) {
      await db.delete(healthPlansTable).where(eq(healthPlansTable.name, name))
    }

    // Clear guardians
    for (const name of guardianNames) {
      await db.delete(guardiansTable).where(eq(guardiansTable.name, name))
    }

    // Clear professionals
    for (const name of professionalNames) {
      await db.delete(professionalsTable).where(eq(professionalsTable.name, name))
    }

    // Clear patients
    for (const name of patientNames) {
      await db.delete(patientsTable).where(eq(patientsTable.name, name))
    }

    console.log('✅ Seed data cleared successfully!')
    return { success: true }
  } catch (error) {
    console.error('❌ Failed to clear seed data:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
