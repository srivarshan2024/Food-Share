# MongoDB to PostgreSQL Migration - Setup Guide

## Overview
All backend code has been successfully updated from MongoDB + Mongoose to PostgreSQL + Prisma ORM. Follow these steps to complete the migration.

---

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

This will install:
- `@prisma/client` - Prisma database client
- `prisma` - Prisma CLI tool
- Removes: mongoose (no longer needed)

---

## Step 2: Configure Environment Variables

### Create `.env` file in `/backend` directory:

```env
# For local PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/foodwaste_db"

# OR For Render PostgreSQL (production):
DATABASE_URL="postgresql://user:password@your-host.render.com:5432/your_database"

# Other variables (keep existing)
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_in_production
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

**Important**: Replace connection details with your actual PostgreSQL credentials.

---

## Step 3: Set Up PostgreSQL Database

### Option A: Local PostgreSQL (Development)

1. **Install PostgreSQL** (if not already installed):
   - Windows: https://www.postgresql.org/download/windows/
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql postgresql-contrib`

2. **Start PostgreSQL service** and create database:
   ```bash
   psql -U postgres
   CREATE DATABASE foodwaste_db;
   ```

3. **Enable PostGIS extension** (for geospatial queries):
   ```bash
   psql -U postgres -d foodwaste_db
   CREATE EXTENSION IF NOT EXISTS postgis;
   \q
   ```

### Option B: Render PostgreSQL (Production)

1. Go to https://render.com
2. Create new PostgreSQL database
3. Copy connection string from dashboard → Use as DATABASE_URL

---

## Step 4: Run Prisma Migrations

```bash
# Generate initial schema and create tables
npx prisma migrate dev --name init

# This will:
# - Create all tables (users, foods, claims)
# - Generate Prisma client
# - Create migration files in prisma/migrations/
```

**Expected output:**
```
✔ Generated Prisma Client (v5.8.0) to ./node_modules/@prisma/client in 98ms

✔ Your database has been created with the initial schema

Migration created in milliseconds
```

---

## Step 5: Verify Database Schema

```bash
# Open Prisma Studio (GUI for database management)
npx prisma studio

# This opens http://localhost:5555 in your browser
# You can view and manage all data here
```

---

## Step 6: Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Expected output:
# ✅ PostgreSQL connected successfully via Prisma
# 🚀 Server running on port 5000
# 📍 Environment: development
# 🌐 API URL: http://localhost:5000/api
```

---

## Step 7: Test API Endpoints

### Test Registration:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "donor",
    "phone": "+1234567890"
  }'
```

### Test Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Nearby Food (requires token):
```bash
curl -X GET "http://localhost:5000/api/foods/nearby?latitude=40.7128&longitude=-74.0060&maxDistance=5000" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Step 8: Deploy to Render

1. **Create PostgreSQL database on Render**:
   - Go to https://render.com/databases
   - Create new PostgreSQL database
   - Copy connection string

2. **Update backend environment variables** on Render:
   - Set `DATABASE_URL` to the connection string
   - Keep other variables (JWT_SECRET, EMAIL_USER, etc.)

3. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Migrate from MongoDB to PostgreSQL with Prisma"
   git push origin main
   ```

4. **Render automatically deploys** when you push to main

---

## Common Issues & Troubleshooting

### Issue: `DATABASE_URL is not set`
**Solution**: Make sure `.env` file exists in `/backend` directory and has `DATABASE_URL` value.

### Issue: `PostGIS extension not found`
**Solution**: Enable PostGIS on your PostgreSQL instance:
```bash
psql -U postgres -d foodwaste_db
CREATE EXTENSION IF NOT EXISTS postgis;
\q
```

### Issue: `Connection refused on localhost:5432`
**Solution**: Make sure PostgreSQL service is running:
- Windows: Start PostgreSQL from Services
- macOS: `brew services start postgresql`
- Linux: `sudo systemctl start postgresql`

### Issue: Port 5000 already in use
**Solution**: Change PORT in `.env` or kill process using port 5000

### Issue: Tables not created
**Solution**: Run migration again:
```bash
npx prisma migrate reset
# WARNING: This deletes all data and recreates schema
```

---

## File Changes Summary

### Created:
- `prisma/schema.prisma` - Database schema definition

### Modified:
- `package.json` - Added Prisma, removed Mongoose
- `.env.example` - Updated with PostgreSQL config
- `config/db.js` - Replaced Mongoose with Prisma connection
- `models/User.js` - Converted to Prisma wrapper functions
- `models/Food.js` - Converted to Prisma wrapper functions with PostGIS query
- `models/Claim.js` - Converted to Prisma wrapper functions
- `controllers/authController.js` - Updated with Prisma queries, added bcryptjs
- `controllers/foodController.js` - Updated with Prisma, PostGIS geospatial query
- `controllers/claimController.js` - Updated with Prisma queries
- `middleware/authMiddleware.js` - Updated User.findById() call
- `server.js` - Updated database connection, added graceful shutdown

---

## Next Steps

1. ✅ **Complete**: Code migration
2. ⏳ **Pending**: Run `npm install` in `/backend` directory
3. ⏳ **Pending**: Create `.env` with PostgreSQL credentials
4. ⏳ **Pending**: Run `npx prisma migrate dev --name init`
5. ⏳ **Pending**: Test all API endpoints locally
6. ⏳ **Pending**: Deploy to Render

---

## Important Notes

- **Data Migration**: This is a fresh start with a new PostgreSQL database. Old MongoDB data is not migrated.
- **PostGIS**: Required for geospatial "nearby food" queries. Must be enabled on your PostgreSQL instance.
- **Prisma Migrations**: All migration files are in `prisma/migrations/`. Commit these to version control for team consistency.
- **Backward Compatibility**: Frontend code requires no changes. All API endpoints remain the same.

---

## Useful Commands

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Open Prisma Studio (visual database manager)
npx prisma studio

# Reset database (⚠️ DELETES ALL DATA)
npx prisma migrate reset

# Check migration status
npx prisma migrate status

# Create new migration
npx prisma migrate dev --name add_new_feature
```

---

## Support Resources

- **Prisma Documentation**: https://www.prisma.io/docs/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **PostGIS Documentation**: https://postgis.net/documentation/
- **Render Docs**: https://render.com/docs

