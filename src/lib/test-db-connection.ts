/**
 * Test file to verify database connection and schema setup
 * This file can be used to test the database connection before running migrations
 * Works with both Neon PostgreSQL and standard PostgreSQL
 */

import { db } from './db'
import { sql } from 'drizzle-orm'

export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...')

    // Test basic connection using Drizzle
    const result = await db.execute(sql`SELECT 1 as test`)
    console.log('✅ Database connection successful:', result)

    // Test if we can query system tables
    const tables = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `)
    console.log('📋 Existing tables:', tables)

    // Detect which database type is being used
    const isProduction = process.env.NODE_ENV === 'production'
    const isNeonDatabase = process.env.DATABASE_URL?.includes('neon.tech') || process.env.USE_NEON === 'true'
    const useNeon = isProduction || isNeonDatabase

    console.log(`🔗 Using ${useNeon ? 'Neon PostgreSQL' : 'standard PostgreSQL'} connection`)

    return {
      success: true,
      message: 'Database connection successful',
      databaseType: useNeon ? 'neon' : 'standard',
      environment: process.env.NODE_ENV || 'development'
    }
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
