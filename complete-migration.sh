#!/bin/bash

# Complete RBAC Migration Script
# This script completes the database migration that was interrupted

set -e  # Exit on error

echo "=========================================="
echo "🚀 Trajectory - Complete RBAC Migration"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo ""
    echo "Please create a .env file with your Supabase credentials:"
    echo ""
    echo "DATABASE_URL=\"postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true\""
    echo "DIRECT_URL=\"postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-1-eu-north-1.pooler.supabase.com:5432/postgres\""
    echo ""
    echo "Get these values from: Supabase Dashboard > Settings > Database > Connection String"
    exit 1
fi

echo "✓ .env file found"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✓ Dependencies installed"
    echo ""
fi

# Step 1: Deploy migrations
echo "=========================================="
echo "Step 1/3: Deploying database migrations"
echo "=========================================="
echo "This will create the new tables (Organization, Role, Permission, etc.)"
echo ""
read -p "Press Enter to continue..."
echo ""

npx prisma migrate deploy

echo ""
echo "✅ Step 1 complete: Tables created"
echo ""

# Step 2: Seed RBAC
echo "=========================================="
echo "Step 2/3: Seeding roles and permissions"
echo "=========================================="
echo "This will create:"
echo "  • 5 roles: owner, admin, manager, editor, viewer"
echo "  • 48 permissions"
echo ""
read -p "Press Enter to continue..."
echo ""

npm run db:seed-rbac

echo ""
echo "✅ Step 2 complete: RBAC seeded"
echo ""

# Step 3: Backfill organizations
echo "=========================================="
echo "Step 3/3: Migrating existing data"
echo "=========================================="
echo "This will migrate Company → Organization and assign roles"
echo ""
read -p "Press Enter to continue..."
echo ""

npm run db:backfill-orgs

echo ""
echo "✅ Step 3 complete: Data migrated"
echo ""

# Verification
echo "=========================================="
echo "🎉 Migration Complete!"
echo "=========================================="
echo ""
echo "Verifying the migration..."
echo ""

# Open Prisma Studio for verification
echo "Opening Prisma Studio to verify data..."
echo "Check that you have:"
echo "  • Organization table with data"
echo "  • Role table with 5 roles"
echo "  • Permission table with ~48 permissions"
echo "  • OrganizationMember table with members"
echo ""
echo "Press Ctrl+C to close Prisma Studio when done."
echo ""
read -p "Press Enter to open Prisma Studio..."

npx prisma studio

echo ""
echo "=========================================="
echo "✅ All done!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Test the application: npm run dev"
echo "  2. Verify deployment: https://your-app.vercel.app"
echo "  3. Check logs in Vercel Dashboard"
echo ""
