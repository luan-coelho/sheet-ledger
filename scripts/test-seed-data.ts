#!/usr/bin/env tsx

/**
 * Test script to verify seeded data can be retrieved
 * Usage: tsx scripts/test-seed-data.ts
 */

import 'dotenv/config'

async function main() {
  console.log('🧪 Testing Seeded Data Retrieval')
  console.log('=================================\n')

  try {
    // Import database operations
    const { 
      professionalOperations, 
      patientOperations, 
      guardianOperations, 
      healthPlanOperations 
    } = await import('../src/lib/db-utils.js')

    // Test retrieving all entities
    console.log('📊 Retrieving seeded data...\n')

    const patients = await patientOperations.getAll()
    console.log(`👥 Patients found: ${patients.length}`)
    patients.forEach((patient, index) => {
      console.log(`  ${index + 1}. ${patient.name} (ID: ${patient.id.substring(0, 8)}...)`)
    })

    const professionals = await professionalOperations.getAll()
    console.log(`\n👨‍⚕️ Professionals found: ${professionals.length}`)
    professionals.forEach((professional, index) => {
      console.log(`  ${index + 1}. ${professional.name} (ID: ${professional.id.substring(0, 8)}...)`)
    })

    const guardians = await guardianOperations.getAll()
    console.log(`\n👨‍👩‍👧‍👦 Guardians found: ${guardians.length}`)
    guardians.forEach((guardian, index) => {
      console.log(`  ${index + 1}. ${guardian.name} (ID: ${guardian.id.substring(0, 8)}...)`)
    })

    const healthPlans = await healthPlanOperations.getAll()
    console.log(`\n🏥 Health Plans found: ${healthPlans.length}`)
    healthPlans.forEach((plan, index) => {
      console.log(`  ${index + 1}. ${plan.name} (ID: ${plan.id.substring(0, 8)}...)`)
    })

    const totalRecords = patients.length + professionals.length + guardians.length + healthPlans.length
    console.log(`\n📈 Total records in database: ${totalRecords}`)

    // Test getting a specific record by ID
    if (patients.length > 0) {
      const firstPatient = patients[0]
      const retrievedPatient = await patientOperations.getById(firstPatient.id)
      console.log(`\n🔍 Test getById - Retrieved patient: ${retrievedPatient?.name}`)
    }

    console.log('\n✅ All data retrieval tests passed!')
    console.log('\n💡 You can now use this data in your application forms and dropdowns.')

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

main()
