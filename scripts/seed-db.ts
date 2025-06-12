#!/usr/bin/env tsx

/**
 * Database seeding script
 * Usage:
 *   tsx scripts/seed-db.ts          - Seeds the database with sample data
 *   tsx scripts/seed-db.ts --clear  - Clears seed data from the database
 */

import 'dotenv/config'

async function main() {
  const shouldClear = process.argv.includes('--clear')
  
  console.log('🌱 Database Seeding Script')
  console.log('==========================\n')

  if (shouldClear) {
    console.log('⚠️  CLEARING SEED DATA - This will delete sample records!')
    console.log('Press Ctrl+C within 3 seconds to cancel...\n')
    
    // Give user a chance to cancel
    await new Promise(resolve => setTimeout(resolve, 3000))
  }

  try {
    // Import TypeScript modules directly with tsx
    const { seedDatabase, clearSeedData } = await import('../src/lib/seed.ts')
    
    let result
    if (shouldClear) {
      result = await clearSeedData()
    } else {
      result = await seedDatabase()
    }
    
    if (result.success) {
      if (shouldClear) {
        console.log('\n🎉 Seed data cleared successfully!')
      } else {
        console.log('\n🎉 Database seeded successfully!')
        if (result.created) {
          console.log(`\n📈 Total records created: ${result.created.total}`)
        }
      }
      process.exit(0)
    } else {
      console.error(`\n❌ Operation failed: ${result.error}`)
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Script execution failed:', error)
    
    if (error.message?.includes('Cannot resolve')) {
      console.error('\n💡 Tip: Make sure your database is set up and environment variables are configured.')
      console.error('   Run "pnpm db:push" first if you haven\'t set up the database schema.')
    }
    
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Operation cancelled by user')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n\n👋 Operation terminated')
  process.exit(0)
})

main()
