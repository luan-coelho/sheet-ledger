import 'dotenv/config'

import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
// Imports condicionais baseados no ambiente
import { drizzle as drizzlePostgres } from 'drizzle-orm/node-postgres'

import * as schema from './schemas'

// Detecta se está em ambiente de desenvolvimento
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined

function createNeonConnection() {
  const sql = neon(process.env.DATABASE_URL!)
  return drizzleNeon(sql, { schema })
}

function createLocalPostgresConnection() {
  return drizzlePostgres(process.env.DATABASE_URL!)
}

function createDatabase() {
  if (false) {
    // Configuração para desenvolvimento local (PostgreSQL com Docker)
    return createLocalPostgresConnection()
  } else {
    // Configuração para produção (Neon na Vercel)
    return createNeonConnection()
  }
}

const db = createDatabase()

export { db, schema }
