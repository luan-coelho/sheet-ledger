import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Environment detection for driver selection
const isProduction = process.env.NODE_ENV === 'production'
const isNeonDatabase = process.env.DATABASE_URL?.includes('neon.tech') || process.env.USE_NEON === 'true'
const useNeon = isProduction || isNeonDatabase

console.log(`🔧 Drizzle Kit using ${useNeon ? 'Neon' : 'standard PostgreSQL'} driver`)

export default defineConfig({
  schema: './src/lib/schemas/*-schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
})
