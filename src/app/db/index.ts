/* import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schemas'

const db = drizzle(process.env.DATABASE_URL!)

export { db, schema } */

import 'dotenv/config'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schemas'

const sql = neon(process.env.DATABASE_URL!)

export const db = drizzle(sql, { schema })

export { schema }
