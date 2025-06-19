import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schemas'

const db = drizzle(process.env.DATABASE_URL!)

export { db, schema }
