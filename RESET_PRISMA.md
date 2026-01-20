# Prisma Reset & Database Migration Guide

This guide will help you completely reset Prisma and migrate to a new database server.

## Step 1: Backup Current Database (Optional but Recommended)

If you have important data, export it first:
```bash
# Export data from current database
pg_dump -h <old-host> -U <username> -d <database> > backup.sql
```

## Step 2: Update DATABASE_URL

Update your `.env` or `.env.local` file with the new database connection string:

```env
DATABASE_URL="postgresql://username:password@new-host:5432/database_name?schema=public"
```

**Important:** 
- Replace `username`, `password`, `new-host`, `5432`, and `database_name` with your actual values
- The `?schema=public` parameter is required for PostgreSQL

## Step 3: Reset Prisma

Run these commands to completely reset Prisma:

```bash
# 1. Generate Prisma client (ensures it's up to date)
npx prisma generate

# 2. Reset the database (drops all tables and data)
npx prisma migrate reset

# 3. Create a fresh migration from your schema
npx prisma migrate dev --name init_fresh

# 4. (Optional) Seed the database if you have seed data
npx prisma db seed
```

## Step 4: Verify Connection

Test the connection:
```bash
# Open Prisma Studio to verify
npx prisma studio
```

## Alternative: Manual Reset (If migrate reset doesn't work)

If `prisma migrate reset` fails, you can manually reset:

```bash
# 1. Drop all tables manually (connect to new database)
psql -h <new-host> -U <username> -d <database> -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 2. Create fresh migration
npx prisma migrate dev --name init_fresh

# 3. Generate client
npx prisma generate
```

## Troubleshooting

### Error: "no schema has been selected"
- Ensure your DATABASE_URL includes `?schema=public` or `?search_path=public`
- The `prisma.config.ts` should automatically add this if missing

### Error: "Connection refused"
- Verify the new database server is accessible
- Check firewall rules and network connectivity
- Verify credentials in DATABASE_URL

### Error: "Database does not exist"
- Create the database first: `CREATE DATABASE database_name;`
- Then update DATABASE_URL and run migrations

## Next Steps

After successful reset:
1. Update any environment-specific configurations
2. Run your application and test database connections
3. Verify all API routes that use Prisma are working
4. Consider setting up database backups for the new server

