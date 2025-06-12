# Migration Guide

This guide explains how to set up and manage database migrations for the Sheet Ledger project.

## Initial Setup

### 1. Environment Setup

Make sure you have your `.env.local` file configured with your Neon database URL:

```bash
DATABASE_URL="postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### 2. Generate Initial Migration

Run the following command to generate your first migration:

```bash
pnpm db:generate
```

This will create a `drizzle` folder with SQL migration files based on your schema definitions.

### 3. Apply Migrations

To apply the migrations to your database:

```bash
pnpm db:push
```

Or for production environments, use:

```bash
pnpm db:migrate
```

## Schema Changes Workflow

When you make changes to your schema files:

1. **Modify Schema**: Update the relevant schema file in `src/lib/schemas/`
2. **Generate Migration**: Run `pnpm db:generate`
3. **Review Migration**: Check the generated SQL in the `drizzle` folder
4. **Apply Migration**: Run `pnpm db:push` (development) or `pnpm db:migrate` (production)

## Common Migration Scenarios

### Adding a New Column

1. Add the column to your schema:
```typescript
export const professionals = pgTable('professionals', {
  // ... existing columns
  newField: text('new_field'),
})
```

2. Generate and apply migration:
```bash
pnpm db:generate
pnpm db:push
```

### Adding a New Table

1. Create a new schema file: `src/lib/schemas/new-entity-schema.ts`
2. Export it from `src/lib/schemas/index.ts`
3. Generate and apply migration

### Modifying Relationships

1. Update the relations in `src/lib/schemas/relations.ts`
2. Update foreign key references if needed
3. Generate and apply migration

## Production Considerations

- Always backup your database before running migrations in production
- Test migrations in a staging environment first
- Use `pnpm db:migrate` instead of `pnpm db:push` in production
- Review generated SQL before applying

## Rollback Strategy

Drizzle doesn't have built-in rollback functionality. For production:

1. Keep database backups before major migrations
2. Write reverse migration scripts manually if needed
3. Test rollback procedures in staging

## Troubleshooting Migrations

### Migration Conflicts
- Check for conflicting schema changes
- Ensure all team members have the latest schema files
- Consider resetting development database if conflicts persist

### Foreign Key Errors
- Ensure referenced tables exist before creating foreign keys
- Check that foreign key columns have the correct data types
- Verify that referenced records exist

### Data Migration
For complex data transformations, create custom migration scripts:

```typescript
// custom-migration.ts
import { db, sql } from '@/lib/db'

async function migrateData() {
  // Custom data transformation logic
  await sql`UPDATE table_name SET column = 'new_value' WHERE condition`
}
```
