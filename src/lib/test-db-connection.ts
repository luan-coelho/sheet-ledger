/**
 * Test file to verify database connection and schema setup
 * This file can be used to test the database connection before running migrations
 */

import { sql } from './db'

export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    const result = await sql`SELECT 1 as test`
    console.log('✅ Database connection successful:', result)
    
    // Test if we can query system tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log('📋 Existing tables:', tables)
    
    return { success: true, message: 'Database connection successful' }
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Example usage function (commented out to avoid auto-execution)
/*
async function runTest() {
  const result = await testDatabaseConnection()
  console.log('Test result:', result)
}

// Uncomment to run the test
// runTest()
*/
