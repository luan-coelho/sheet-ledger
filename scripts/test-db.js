#!/usr/bin/env node

/**
 * Simple script to test database connection
 * Usage: node scripts/test-db.js
 */

const { testDatabaseConnection } = require('../src/lib/test-db-connection.ts')

async function main() {
  console.log('🧪 Testing database connection...\n')
  
  try {
    const result = await testDatabaseConnection()
    
    if (result.success) {
      console.log('✅ Database connection test passed!')
      console.log(`📊 Database type: ${result.databaseType}`)
      console.log(`🌍 Environment: ${result.environment}`)
    } else {
      console.log('❌ Database connection test failed!')
      console.log(`Error: ${result.error}`)
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Test script failed:', error)
    process.exit(1)
  }
}

main()
