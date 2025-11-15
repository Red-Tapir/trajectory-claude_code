# Migration Guide: Multi-Tenant + RBAC Implementation

## What's New

This update implements a complete multi-tenant architecture with Role-Based Access Control (RBAC) for Trajectory. The system has been transformed from a single-tenant application to a fully multi-tenant SaaS platform.

## Key Changes

### 1. Database Schema Changes
- **Company → Organization**: The `Company` model has been renamed to `Organization` with a new `slug` field for URL-friendly identifiers
- **New Models Added**:
  - `Role`: Defines user roles (owner, admin, manager, editor, viewer)
  - `Permission`: Defines granular permissions (e.g., "client:create", "invoice:read")
  - `RolePermission`: Maps roles to permissions
  - `AuditLog`: Tracks all important actions for compliance
  - `OrganizationMember`: Replaces `CompanyMember` with role assignment

### 2. Multi-Tenant Features
- **Automatic Organization Creation**: New users get their own organization on signup
- **Organization Switching**: Users can be members of multiple organizations
- **Data Isolation**: All queries are automatically scoped to the current organization
- **Role-Based Permissions**: Fine-grained access control for all resources

### 3. New API Endpoints
- `POST /api/organizations` - Create new organization
- `GET /api/organizations` - Get user's organizations
- `POST /api/organizations/switch` - Switch current organization
- `GET /api/organizations/[id]/members` - List organization members
- `POST /api/organizations/[id]/members` - Invite member
- `PATCH /api/organizations/[id]/members/[memberId]` - Update member role
- `DELETE /api/organizations/[id]/members/[memberId]` - Remove member

### 4. Updated API Endpoints
All existing API endpoints have been updated with:
- Permission checks using the new RBAC system
- Organization-scoped Prisma queries
- Audit logging for important actions

### 5. New UI Components
- **WorkspaceSwitcher**: Dropdown component to switch between organizations
- **DropdownMenu**: Radix UI dropdown menu component

## Migration Steps

### Step 1: Install New Dependencies

```bash
npm install @radix-ui/react-dropdown-menu
```

### Step 2: Run Database Migration

This will update your database schema with all the new multi-tenant tables:

```bash
npm run db:migrate
```

When prompted, give the migration a name like "multi_tenant_rbac".

### Step 3: Seed Roles and Permissions

This creates the 5 default roles and all permissions:

```bash
npm run db:seed-rbac
```

This will create:
- **Owner** (priority 100): Full access to everything including billing
- **Admin** (priority 90): Manage members, clients, invoices, budgets
- **Manager** (priority 70): Create/edit clients, invoices, budgets
- **Editor** (priority 50): Create/edit clients and invoices
- **Viewer** (priority 10): Read-only access

### Step 4: Migrate Existing Data

This backfills existing Company data into the new Organization model:

```bash
npm run db:backfill-orgs
```

This script will:
- Convert all `Company` records to `Organization` records
- Generate unique slugs for each organization
- Convert `CompanyMember` to `OrganizationMember` with appropriate roles
- Set `currentOrganizationId` for all users

### Step 5: Update Environment Variables

Make sure your `.env` file has the correct database connection:

```env
DATABASE_URL="postgresql://postgres.oldqqjoledhllbsokexa:Dtch1kKl2zAn09CS@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.oldqqjoledhllbsokexa:Dtch1kKl2zAn09CS@aws-1-eu-north-1.pooler.supabase.com:5432/postgres"
```

### Step 6: Deploy to Vercel

Push your changes and Vercel will automatically deploy:

```bash
git add .
git commit -m "feat: Implement multi-tenant architecture with RBAC"
git push -u origin claude/resume-conversation-01GbhVM7iCqyr1XmmW4HuiV6
```

## New Helper Libraries

### Permission Checking (`lib/permissions.ts`)

```typescript
import { can, canAll, canAny, isOwner, requirePermission } from "@/lib/permissions"

// Check single permission
const hasPermission = await can(userId, organizationId, "client:create")

// Check multiple permissions (all required)
const hasAll = await canAll(userId, organizationId, ["client:create", "client:update"])

// Check multiple permissions (any one required)
const hasAny = await canAny(userId, organizationId, ["client:create", "client:update"])

// Check if user is owner
const isOrgOwner = await isOwner(userId, organizationId)

// Require permission (throws error if not allowed)
await requirePermission(userId, organizationId, "client:delete")
```

### Organization-Scoped Prisma (`lib/prisma-scoped.ts`)

```typescript
import { createPrismaScoped } from "@/lib/prisma-scoped"

// Create scoped client
const scoped = createPrismaScoped(organizationId)

// All queries automatically filtered by organizationId
const clients = await scoped.client.findMany() // Only returns clients for this org
const invoice = await scoped.invoice.create({ data: {...} }) // Auto-adds organizationId
```

### Organization Management (`lib/organization.ts`)

```typescript
import {
  createOrganization,
  getUserOrganizations,
  switchOrganization,
  inviteToOrganization,
  removeMember,
  updateMemberRole
} from "@/lib/organization"

// Create organization
const org = await createOrganization({
  name: "Acme Corp",
  userId: "user_123",
  plan: "trial"
})

// Get user's organizations
const orgs = await getUserOrganizations(userId)

// Switch organization
await switchOrganization({ userId, organizationId })

// Invite member
await inviteToOrganization({
  organizationId,
  email: "user@example.com",
  roleId: "role_123",
  invitedBy: userId
})
```

### Audit Logging (`lib/audit.ts`)

```typescript
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit"

await logAudit({
  organizationId,
  userId,
  action: AUDIT_ACTIONS.CLIENT_CREATED,
  resource: "client",
  resourceId: client.id,
  metadata: {
    name: client.name,
    type: client.type
  },
  ipAddress: req.headers.get("x-forwarded-for"),
  userAgent: req.headers.get("user-agent")
})
```

## Permission System

Permissions follow the format `resource:action`:

### Resources
- `organization` - Organization settings
- `member` - Team members
- `client` - Clients & CRM
- `invoice` - Invoices
- `budget` - Budgets
- `scenario` - Scenarios
- `export` - Data exports
- `settings` - Settings
- `billing` - Billing & subscription

### Actions
- `create` - Create new records
- `read` - View records
- `update` - Edit records
- `delete` - Delete records
- `manage` - Full management (includes all above)

### Wildcards
- `*` - All permissions (owner only)
- `resource:*` - All actions on a resource

## Testing

After migration, test the following:

1. **Login & Organization**: Users should be assigned to their existing organization
2. **Client Creation**: Create a new client and verify permissions work
3. **Invoice Creation**: Create a new invoice
4. **Organization Switching**: If you create a new organization, test switching between them
5. **Member Management**: Invite a new member and assign them a role
6. **Audit Logs**: Check that actions are being logged to the `AuditLog` table

## Rollback (If Needed)

If you need to rollback:

```bash
npx prisma migrate reset
```

⚠️ **Warning**: This will delete all data! Only use in development.

## Support

If you encounter any issues during migration, check:
1. Database connection is working
2. All environment variables are set
3. Prisma client is regenerated (`npm run postinstall`)
4. Migration ran successfully without errors

## Next Steps

After successful migration:

1. **Add Workspace Switcher to UI**: Add the `<WorkspaceSwitcher />` component to your dashboard layout
2. **Create Organization Settings Page**: Build UI for managing organization settings
3. **Create Member Management Page**: Build UI for inviting/removing members
4. **Add Audit Log Viewer**: Build UI to view audit logs
5. **Update Subscription Logic**: Connect subscription plans to organizations

## Files Changed

### New Files
- `lib/permissions.ts` - Permission checking system
- `lib/prisma-scoped.ts` - Organization-scoped Prisma client
- `lib/organization.ts` - Organization management
- `lib/audit.ts` - Audit logging
- `prisma/seed-rbac.ts` - Seed roles and permissions
- `prisma/backfill-organizations.ts` - Migrate Company → Organization
- `components/dashboard/workspace-switcher.tsx` - Organization switcher UI
- `components/ui/dropdown-menu.tsx` - Dropdown menu component
- `app/api/organizations/route.ts` - Organization API
- `app/api/organizations/switch/route.ts` - Switch organization
- `app/api/organizations/[id]/members/route.ts` - Member list/invite
- `app/api/organizations/[id]/members/[memberId]/route.ts` - Member update/delete

### Updated Files
- `prisma/schema.prisma` - Complete schema overhaul
- `lib/auth.ts` - Multi-tenant auth support
- `types/next-auth.d.ts` - Session type updates
- `app/api/clients/route.ts` - Added permissions and scoping
- `app/api/invoices/route.ts` - Added permissions and scoping
- `package.json` - Added new dependencies and scripts
