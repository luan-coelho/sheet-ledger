# Environment-Based Database Configuration

This project supports dual database configurations to optimize development and production workflows:

- **Production Environment**: Uses Neon PostgreSQL (serverless, optimized for production)
- **Local Development**: Uses standard PostgreSQL (faster local development, no network latency)

## How It Works

The application automatically detects the environment and selects the appropriate database driver:

### Neon PostgreSQL (Production)
- **When**: `NODE_ENV=production` OR `DATABASE_URL` contains `neon.tech` OR `USE_NEON=true`
- **Driver**: `@neondatabase/serverless` with `drizzle-orm/neon-http`
- **Benefits**: Serverless, auto-scaling, optimized for production workloads

### Standard PostgreSQL (Development)
- **When**: Development environment (default)
- **Driver**: `pg` with `drizzle-orm/node-postgres`
- **Benefits**: Faster local queries, no network latency, full PostgreSQL features

## Quick Setup

### 1. Local Development Setup

```bash
# Install and start PostgreSQL (choose one method)

# Method 1: Docker (Recommended)
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=sheetledger \
  -p 5432:5432 -d postgres:15

# Method 2: Local PostgreSQL installation
createdb sheetledger

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sheetledger"
```

### 2. Production Setup (Neon)

```bash
# 1. Create Neon database at https://neon.tech
# 2. Get connection string from dashboard
# 3. Set environment variables:
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require"
NODE_ENV=production
```

## Testing Your Setup

```bash
# Test database connection
pnpm db:test

# Generate and apply schema
pnpm db:generate
pnpm db:push

# Open database studio
pnpm db:studio
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `postgresql://...` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `USE_NEON` | Force Neon usage in development | `true` or `false` |

## Switching Between Environments

### Force Neon in Development
```bash
# In .env.local
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require"
USE_NEON=true
```

### Use Local PostgreSQL in Development (Default)
```bash
# In .env.local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sheetledger"
# USE_NEON not set or false
```

## Troubleshooting

### Connection Issues
1. **Local PostgreSQL**: Ensure PostgreSQL is running and database exists
2. **Neon**: Check connection string and ensure database is not paused
3. **Test connection**: Run `pnpm db:test` to diagnose issues

### Migration Issues
- Drizzle Kit automatically uses the correct driver based on environment
- Both database types use the same schema files
- Migrations are compatible between both environments

### Performance Considerations
- **Local Development**: Use standard PostgreSQL for faster development
- **Production**: Use Neon for serverless benefits and auto-scaling
- **Staging**: Can use either based on your needs

## Benefits of This Setup

1. **Faster Development**: No network latency with local PostgreSQL
2. **Production Optimized**: Neon's serverless architecture for production
3. **Seamless Switching**: Automatic environment detection
4. **Same Schema**: Identical database structure across environments
5. **Easy Testing**: Simple connection testing with `pnpm db:test`
