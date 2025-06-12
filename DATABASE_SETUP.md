# Database Setup Guide

This project uses Drizzle ORM with environment-based database configuration:
- **Production**: Neon PostgreSQL (serverless)
- **Local Development**: Standard PostgreSQL

## Prerequisites

### For Production (Neon PostgreSQL)
1. Create a Neon PostgreSQL database at [neon.tech](https://neon.tech)
2. Get your connection string from the Neon dashboard

### For Local Development (Standard PostgreSQL)
1. Install PostgreSQL locally or use Docker:
   ```bash
   # Using Docker
   docker run --name postgres-dev -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sheetledger -p 5432:5432 -d postgres:15

   # Or install PostgreSQL locally and create database
   createdb sheetledger
   ```

## Setup Instructions

### 1. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Configure your `.env.local` file:

   **For Local Development (Standard PostgreSQL):**
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sheetledger"
   ```

   **For Production (Neon PostgreSQL):**
   ```
   DATABASE_URL="postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"
   NODE_ENV=production
   ```

   **To Force Neon Usage in Development:**
   ```
   DATABASE_URL="postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"
   USE_NEON=true
   ```

### 2. Environment Detection

The application automatically detects which database driver to use:

1. **Neon PostgreSQL** is used when:
   - `NODE_ENV=production` (production environment)
   - `DATABASE_URL` contains `neon.tech` (Neon connection string detected)
   - `USE_NEON=true` (explicitly forced)

2. **Standard PostgreSQL** is used when:
   - Running in development mode (`NODE_ENV` is not `production`)
   - `DATABASE_URL` does not contain `neon.tech`
   - `USE_NEON` is not set to `true`

The console will display which database type is being used when the application starts.

### 3. Database Schema

The project includes the following independent entities (no relationships):

- **Professionals**: Healthcare professionals with only name field (required)
- **Patients**: Patient records with only name field (required)
- **Guardians**: Responsible persons/guardians with only name field (required)
- **Health Plans**: Health insurance plans with only name field (required)

### 4. Generate and Run Migrations

1. Generate migration files:
   ```bash
   pnpm db:generate
   ```

2. Push schema to database:
   ```bash
   pnpm db:push
   ```

### 5. Available Scripts

- `pnpm db:generate` - Generate migration files from schema changes
- `pnpm db:migrate` - Run pending migrations
- `pnpm db:push` - Push schema changes directly to database (development)
- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm db:seed` - Populate database with sample data for testing
- `pnpm db:seed:clear` - Remove sample data from database
- `pnpm db:seed:test` - Test retrieval of seeded data

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

Before running migrations, you can test your database connection. The test function works with both database types:

```typescript
import { testDatabaseConnection } from '@/lib/test-db-connection'

// Test the connection
const result = await testDatabaseConnection()
console.log(result)
// Output includes database type (neon/standard) and environment info
```

The test will show:
- Connection success/failure
- Database type being used (Neon or standard PostgreSQL)
- Current environment
- Existing tables in the database

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
4. **Seed Database**: Populate with sample data for testing (see Database Seeding section below)

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

## Database Seeding

The project includes a comprehensive seeding system to populate your database with realistic sample data for testing and development.

### Quick Start

1. **Seed the database** with sample data:
   ```bash
   pnpm db:seed
   ```

2. **Clear seed data** when needed:
   ```bash
   pnpm db:seed:clear
   ```

### What Gets Seeded

The seed script creates sample records for all four main entities:

- **8 Patients** - Brazilian names like "Ana Silva Santos", "Carlos Eduardo Oliveira"
- **6 Professionals** - Healthcare professionals with specialties like "Dr. Ricardo Cardoso - Cardiologista"
- **4 Guardians** - Responsible parties like "Sandra Regina Santos"
- **5 Health Plans** - Insurance plans like "Unimed Nacional", "Bradesco Saúde"

### Safe Operation

- **Duplicate Prevention**: The seed script checks for existing records before inserting
- **Multiple Runs**: Can be run multiple times safely without creating duplicates
- **Clear Function**: Removes only the specific sample data, not other records
- **Environment Aware**: Works with both Neon PostgreSQL (production) and standard PostgreSQL (local)

### Usage Examples

```bash
# First time setup - seed with sample data
pnpm db:push  # Ensure schema is up to date
pnpm db:seed  # Add sample data

# During development - refresh sample data
pnpm db:seed:clear  # Remove old sample data
pnpm db:seed        # Add fresh sample data

# Check your data
pnpm db:studio      # Open Drizzle Studio to view records
pnpm db:seed:test   # Test data retrieval programmatically
```

### Sample Data Structure

All entities follow the simplified schema with only required name fields:

```typescript
// Sample patients
{ name: 'Ana Silva Santos' }
{ name: 'Carlos Eduardo Oliveira' }

// Sample professionals
{ name: 'Dr. Ricardo Cardoso - Cardiologista' }
{ name: 'Dra. Patrícia Mendes - Pediatra' }

// Sample guardians
{ name: 'Sandra Regina Santos' }
{ name: 'José Carlos Oliveira' }

// Sample health plans
{ name: 'Unimed Nacional' }
{ name: 'Bradesco Saúde' }
```

### Integration with Your App

After seeding, you can immediately use the sample data in your application:

```typescript
import { professionalOperations, patientOperations } from '@/lib/db-utils'

// Get all seeded professionals for dropdowns
const professionals = await professionalOperations.getAll()

// Get all seeded patients for selection
const patients = await patientOperations.getAll()
```
