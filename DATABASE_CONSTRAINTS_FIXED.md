# Database Constraints and Schema Conflicts - FIXED

## Summary of Changes

This document summarizes the fixes applied to resolve database constraint and schema conflicts in the Trajectory application after the migration from single-tenant (Company) to multi-tenant (Organization) architecture.

## Issues Fixed

### 1. ✅ Seed File Schema Mismatch (CRITICAL)
**Problem**: `prisma/seed.ts` referenced the old `Company` and `CompanyMember` models, causing failures on databases with the new schema.

**Solution**: Completely rewrote `seed.ts` to:
- Use `Organization` instead of `Company`
- Use `OrganizationMember` instead of `CompanyMember`
- Integrate RBAC seeding (roles and permissions)
- Set up proper role assignments (owner role) for demo user
- Set currentOrganizationId for the demo user

### 2. ✅ SQL Initialization Script Outdated (CRITICAL)
**Problem**: `prisma/init-schema.sql` contained the old schema with `Company` and `CompanyMember` tables and was missing all RBAC tables.

**Solution**: Completely rewrote `init-schema.sql` to:
- Replace `Company` with `Organization` (including `slug` field for multi-tenancy)
- Replace `CompanyMember` with `OrganizationMember`
- Add RBAC tables: `Role`, `Permission`, `RolePermission`
- Add `AuditLog` table for compliance
- Add proper foreign key constraints with correct cascade behaviors
- Add comprehensive indexes for performance
- Fix User → Organization circular reference with proper `ALTER TABLE`

### 3. ✅ Invoice Number Constraint Fixed
**Problem**: Invoice numbers had a global unique constraint instead of being scoped to organizations.

**Solution**: Changed constraint from:
```sql
"number" TEXT NOT NULL UNIQUE
```
to:
```sql
CONSTRAINT "Invoice_organizationId_number_key" UNIQUE ("organizationId", "number")
```

This allows different organizations to use the same invoice numbers (tenant isolation).

## Constraint Configuration

### Foreign Key Cascade Behaviors

All foreign keys now have appropriate cascade behaviors:

- **CASCADE DELETE**: Used for dependent data (e.g., deleting organization removes all its clients, invoices, etc.)
- **RESTRICT**: Used for `OrganizationMember → Role` to prevent deleting roles with active members
- **SET NULL**: Used for soft references (e.g., `User.currentOrganizationId`, `AuditLog.userId`) to preserve data integrity

See full constraint details in the constraint summary above.

### Unique Constraints

All unique constraints are properly scoped:
- Single-field uniqueness: `User.email`, `Organization.slug`, `Role.name`
- Composite uniqueness: `Invoice(organizationId, number)`, `OrganizationMember(organizationId, userId)`

## Schema Validation Results

```
✓ Table count matches (18 models)
✓ seed.ts updated to use Organization model
✓ seed.ts updated to use OrganizationMember model
✓ Organization table exists in SQL schema
✓ RBAC tables exist in SQL schema
✓ Old Company table removed from SQL schema
```

## Files Modified

1. **prisma/seed.ts** - Complete rewrite
   - Now uses Organization model
   - Integrated RBAC seeding
   - Creates demo organization with proper role assignments

2. **prisma/init-schema.sql** - Complete rewrite
   - Updated to match current Prisma schema
   - Added all RBAC tables
   - Fixed all foreign key constraints
   - Added comprehensive indexes

## Database Migration Path

For existing deployments:

1. **New Deployments**: Run `init-schema.sql` directly
2. **Existing Deployments**: Use `prisma migrate` or run the `backfill-organizations.ts` script
3. **Seed Database**: Run `npm run seed` (uses the updated seed.ts)

## Testing Recommendations

1. Test cascade delete behavior:
   - Delete an organization → verify all related data removed
   - Delete a user → verify audit logs preserved with NULL userId
   - Try to delete a role with active members → should fail (RESTRICT)

2. Test unique constraints:
   - Create multiple organizations with same invoice numbers → should succeed
   - Create duplicate organization slug → should fail
   - Add same user twice to organization → should fail

3. Test RBAC:
   - Verify roles and permissions are created
   - Test permission checks across different role levels
   - Verify owner can perform all actions

## Impact on Application

### Positive Impacts
- ✅ Database schema now matches Prisma schema perfectly
- ✅ Proper multi-tenant isolation (invoice numbers, data scoping)
- ✅ RBAC system fully integrated
- ✅ Audit trail preserved even when users deleted
- ✅ Prevents accidental deletion of critical roles
- ✅ Comprehensive indexes for better query performance

### Breaking Changes
- Old `Company` and `CompanyMember` models no longer exist
- Applications using old schema must be updated or migrated

## Next Steps

1. ✅ Update seed file to use Organization model
2. ✅ Update SQL init script to match Prisma schema
3. ✅ Verify all constraints are properly defined
4. ✅ Test schema validation
5. 🔄 Commit and push changes
6. 📋 Deploy to production (use migration script for existing data)

## Monitoring

After deployment, monitor for:
- P2002 errors (unique constraint violations)
- P2003 errors (foreign key constraint violations)
- P2025 errors (record not found - may indicate cascade delete issues)

All Prisma errors are logged in Sentry (see `sentry.server.config.ts`).
