import { drizzle } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'
import { neon } from '@neondatabase/serverless'
import { Pool } from 'pg'
import * as schema from './schemas/index'

// Environment detection
const isProduction = process.env.NODE_ENV === 'production'
const isNeonDatabase = process.env.DATABASE_URL?.includes('neon.tech') || process.env.USE_NEON === 'true'

// Use Neon in production or when explicitly configured
const useNeon = isProduction || isNeonDatabase

let db: ReturnType<typeof drizzle> | ReturnType<typeof drizzlePg>

if (useNeon) {
  // Neon PostgreSQL configuration (production or explicit)
  console.log('🔗 Using Neon PostgreSQL connection')
  const sql = neon(process.env.DATABASE_URL!)
  db = drizzle(sql, { schema })
} else {
  // Standard PostgreSQL configuration (local development)
  console.log('🔗 Using standard PostgreSQL connection')
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  db = drizzlePg(pool, { schema })
}

export { db, schema }
