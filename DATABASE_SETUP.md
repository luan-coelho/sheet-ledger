# Database Setup Guide

This project uses Drizzle ORM with Neon PostgreSQL database.

## Prerequisites

1. Create a Neon PostgreSQL database at [neon.tech](https://neon.tech)
2. Get your connection string from the Neon dashboard

## Setup Instructions

### 1. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your actual Neon connection string:
   ```
   DATABASE_URL="postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```

### 2. Database Schema

The project includes the following independent entities (no relationships):

- **Professionals**: Healthcare professionals with only name field (required)
- **Patients**: Patient records with only name field (required)
- **Guardians**: Responsible persons/guardians with only name field (required)
- **Health Plans**: Health insurance plans with only name field (required)

### 3. Generate and Run Migrations

1. Generate migration files:
   ```bash
   pnpm db:generate
   ```

2. Push schema to database:
   ```bash
   pnpm db:push
   ```

### 4. Available Scripts

- `pnpm db:generate` - Generate migration files from schema changes
- `pnpm db:migrate` - Run pending migrations
- `pnpm db:push` - Push schema changes directly to database (development)
- `pnpm db:studio` - Open Drizzle Studio for database management

## Schema Overview

### Professionals
- ID (UUID, Primary Key)
- Name (Required)
- Timestamps

### Patients
- ID (UUID, Primary Key)
- Name (Required)
- Timestamps

### Guardians
- ID (UUID, Primary Key)
- Name (Required)
- Timestamps

### Health Plans
- ID (UUID, Primary Key)
- Name (Required)
- Timestamps

## Usage Examples

### Import Database Operations
```typescript
import { db } from '@/lib/db'
import { professionalOperations, patientOperations, guardianOperations } from '@/lib/db-utils'

// Get all professionals
const professionals = await professionalOperations.getAll()

// Get patient by ID
const patient = await patientOperations.getById(patientId)

// Get all guardians
const guardians = await guardianOperations.getAll()
```

### Direct Database Queries
```typescript
import { db } from '@/lib/db'
import { professionals, patients } from '@/lib/schemas'
import { eq } from 'drizzle-orm'

// Custom query
const result = await db
  .select()
  .from(professionals)
  .where(eq(professionals.name, 'Dr. Smith'))
```

## Development Tips

1. Use Drizzle Studio for visual database management:
   ```bash
   pnpm db:studio
   ```

2. Always generate migrations after schema changes:
   ```bash
   pnpm db:generate
   ```

3. Use the provided utility functions in `db-utils.ts` for common operations

4. All schemas include Zod validation for type safety

## Testing the Setup

Before running migrations, you can test your database connection:

```typescript
import { testDatabaseConnection } from '@/lib/test-db-connection'

// Test the connection
const result = await testDatabaseConnection()
console.log(result)
```

## Troubleshooting

1. **Connection Issues**:
   - Verify your DATABASE_URL is correct and the database is accessible
   - Check if your Neon database is active (not paused)
   - Ensure the connection string includes `?sslmode=require`

2. **Migration Errors**:
   - Check if there are conflicting schema changes
   - Try dropping and recreating the database if in development
   - Verify all foreign key references are correct

3. **Type Errors**:
   - Regenerate types after schema changes with `pnpm db:generate`
   - Restart your TypeScript server in your IDE
   - Check for circular import issues in schema files

4. **Schema Simplicity**:
   - All tables are now independent with no foreign key relationships
   - Each entity (Professional, Patient, Guardian, Health Plan) has only a name field as required
   - All entities follow the same simple structure

## Next Steps

After setting up the database:

1. **Create API Routes**: Add CRUD operations for each entity
2. **Update Forms**: Integrate the new schemas with your existing forms
3. **Add Validation**: Use the Zod schemas for form validation
4. **Create Seed Data**: Add initial data for testing

## Integration with Existing Code

The current spreadsheet form can be enhanced to use the database:

```typescript
// Instead of hardcoded strings, use database entities
const professionals = await professionalOperations.getAll()
const patients = await patientOperations.getAll()
const guardians = await guardianOperations.getAll()
const healthPlans = await healthPlanOperations.getAll()

// Simple entities with just name field
const newProfessional = await professionalOperations.create({ name: "Dr. João Silva" })
const newPatient = await patientOperations.create({ name: "Maria Santos" })
const newGuardian = await guardianOperations.create({ name: "José Santos" })
```
