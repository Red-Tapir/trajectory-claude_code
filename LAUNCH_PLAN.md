# 🚀 Plan de Finalisation - Trajectory
## 2-3 Jours Avant Lancement Public

**Date de début:** 2026-01-13
**Date de lancement cible:** 2026-01-16
**Temps estimé total:** 20-24 heures

---

## 📅 JOUR 1 - SÉCURITÉ & INFRASTRUCTURE (8h)
> **Objectif:** Sécuriser l'application pour la production

### 🔴 Priorité Critique

#### 1. Étendre le middleware de protection (1h30)
**Fichier:** `middleware.ts`

**Problème actuel:**
```typescript
matcher: ["/dashboard/:path*", "/api/clients/:path*", "/api/invoices/:path*", "/api/budgets/:path*"]
```

**À faire:**
- [ ] Ajouter `/api/organizations/:path*`
- [ ] Ajouter `/api/subscription/:path*`
- [ ] Ajouter `/api/stripe/checkout`
- [ ] Ajouter `/api/stripe/portal`
- [ ] Exclure uniquement `/api/stripe/webhook` (besoin de signature Stripe)
- [ ] Exclure `/api/auth/*` (NextAuth gère)

**Code à implémenter:**
```typescript
matcher: [
  "/dashboard/:path*",
  "/api/clients/:path*",
  "/api/invoices/:path*",
  "/api/budgets/:path*",
  "/api/organizations/:path*",
  "/api/subscription/:path*",
  "/api/stripe/checkout",
  "/api/stripe/portal",
]
```

**Test:**
```bash
# Tester sans auth
curl http://localhost:3000/api/organizations
# → Devrait retourner 401

# Tester avec auth
curl -H "Cookie: next-auth.session-token=xxx" http://localhost:3000/api/organizations
# → Devrait retourner 200
```

---

#### 2. Rate limiting sur endpoints critiques (2h)
**Fichiers:**
- `app/api/auth/register/route.ts`
- `app/api/organizations/route.ts`
- `app/api/organizations/[id]/members/route.ts`

**À implémenter:**

**a) Rate limit registration (5 inscriptions/heure/IP)**
```typescript
// app/api/auth/register/route.ts
import { ratelimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'anonymous'
  const { success } = await ratelimit.limit(`register_${ip}`)

  if (!success) {
    return NextResponse.json(
      { error: "Trop de tentatives d'inscription. Réessayez dans 1 heure." },
      { status: 429 }
    )
  }
  // ... rest of code
}
```

**b) Rate limit organization creation (3 orgs/jour/user)**
```typescript
// app/api/organizations/route.ts
const { success } = await ratelimit.limit(`create_org_${userId}`)
```

**c) Rate limit member invitations (20/heure/org)**
```typescript
// app/api/organizations/[id]/members/route.ts
const { success } = await ratelimit.limit(`invite_member_${organizationId}`)
```

---

#### 3. RBAC checks dans routes API manquantes (1h30)
**Routes à vérifier:**

- [ ] `app/api/organizations/route.ts` - POST (vérifier quota)
- [ ] `app/api/organizations/[id]/route.ts` - UPDATE/DELETE (owner only)
- [ ] `app/api/organizations/[id]/members/[memberId]/route.ts` - UPDATE/DELETE (admin+)
- [ ] `app/api/stripe/checkout/route.ts` - (owner/admin only)
- [ ] `app/api/stripe/portal/route.ts` - (owner/admin only)

**Pattern à suivre:**
```typescript
const hasPermission = await can(
  session.user.id,
  organizationId,
  "organization:update"
)

if (!hasPermission) {
  return NextResponse.json(
    { error: "Permission refusée" },
    { status: 403 }
  )
}
```

---

#### 4. Configurer Sentry monitoring (1h)
**Fichiers à créer/modifier:**
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

**Configuration:**
```typescript
// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,

  // Ignorer certaines erreurs
  ignoreErrors: [
    "Non-Error promise rejection captured",
    "ResizeObserver loop limit exceeded",
  ],

  // Avant d'envoyer, nettoyer données sensibles
  beforeSend(event) {
    if (event.request?.cookies) {
      delete event.request.cookies
    }
    return event
  },
})
```

**Tester:**
```typescript
// Page de test: app/api/test-sentry/route.ts
export async function GET() {
  throw new Error("Test Sentry error!")
}
```

---

#### 5. Audit variables d'environnement (1h)
**Créer checklist de validation:**

```bash
# Script: scripts/check-env.ts
#!/usr/bin/env tsx

const requiredVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRODUCT_ID_STARTER',
  'STRIPE_PRICE_ID_STARTER',
  'STRIPE_PRODUCT_ID_PRO',
  'STRIPE_PRICE_ID_PRO',
  'NEXT_PUBLIC_APP_URL',
]

const optionalVars = [
  'RESEND_API_KEY',
  'UPSTASH_REDIS_REST_URL',
  'GOOGLE_CLIENT_ID',
  'NEXT_PUBLIC_SENTRY_DSN',
]

// Check and report
```

**Vérifier:**
- [ ] `.env.example` est à jour
- [ ] Railway variables correspondent
- [ ] Pas de secrets hardcodés dans le code
- [ ] `NEXTAUTH_SECRET` est fort (32+ chars)

---

#### 6. Tests de sécurité RBAC (2h)
**Créer:** `tests/security.test.ts`

**Scénarios à tester:**
```typescript
describe('RBAC Security', () => {
  test('Viewer cannot create clients', async () => {
    // Create user with viewer role
    // Try to POST /api/clients
    // Expect 403
  })

  test('Editor cannot delete invoices', async () => {
    // Create user with editor role
    // Try to DELETE /api/invoices/[id]
    // Expect 403
  })

  test('Manager cannot delete organization', async () => {
    // Create user with manager role
    // Try to DELETE /api/organizations/[id]
    // Expect 403
  })

  test('User cannot access other org data', async () => {
    // Create 2 orgs
    // User A tries to GET /api/clients from org B
    // Expect 403 or empty []
  })
})
```

**Exécuter:**
```bash
npm run test tests/security.test.ts
```

---

## 📅 JOUR 2 - UX & FONCTIONNALITÉS (8h)
> **Objectif:** Finaliser l'expérience utilisateur

### 🟡 Priorité Haute

#### 1. Système d'invitation par email (2h30)
**Fichiers à modifier:**
- `lib/organization.ts` (ligne 195)
- `lib/email.ts` (nouveau template)
- Créer `app/invitation/[token]/page.tsx`

**1.1 - Modèle d'invitation avec token**
```typescript
// prisma/schema.prisma - Ajouter
model OrganizationInvitation {
  id             String   @id @default(cuid())
  organizationId String
  email          String
  roleId         String
  token          String   @unique
  invitedBy      String
  expiresAt      DateTime
  status         String   @default("pending") // pending, accepted, expired
  createdAt      DateTime @default(now())

  organization   Organization @relation(...)
  invitedByUser  User @relation(...)
  role           Role @relation(...)
}
```

**1.2 - Générer invitation**
```typescript
// lib/organization.ts
export async function inviteToOrganization(params) {
  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours

  // Create invitation
  const invitation = await prisma.organizationInvitation.create({
    data: {
      organizationId,
      email,
      roleId,
      token,
      invitedBy,
      expiresAt
    }
  })

  // Send email
  await sendInvitationEmail({
    to: email,
    organizationName: org.name,
    invitedByName: inviter.name,
    invitationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invitation/${token}`,
    roleName: role.displayName
  })

  return invitation
}
```

**1.3 - Template email**
```typescript
// lib/email.ts
export async function sendInvitationEmail(params) {
  return resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: params.to,
    subject: `Invitation à rejoindre ${params.organizationName} sur Trajectory`,
    html: `
      <h1>Vous avez été invité!</h1>
      <p>${params.invitedByName} vous invite à rejoindre <strong>${params.organizationName}</strong></p>
      <p>Rôle: ${params.roleName}</p>
      <a href="${params.invitationUrl}">Accepter l'invitation</a>
      <p><small>Ce lien expire dans 7 jours</small></p>
    `
  })
}
```

**1.4 - Page d'acceptation**
```typescript
// app/invitation/[token]/page.tsx
export default async function InvitationPage({ params }) {
  const invitation = await prisma.organizationInvitation.findUnique({
    where: { token: params.token },
    include: { organization: true, role: true }
  })

  if (!invitation || invitation.status !== 'pending') {
    return <div>Invitation invalide ou expirée</div>
  }

  // Si utilisateur connecté → accepter directement
  // Sinon → rediriger vers inscription avec email pré-rempli
}
```

---

#### 2. Dialog création d'organisation (1h30)
**Fichier:** `components/dashboard/create-organization-dialog.tsx`

**Composant:**
```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CreateOrganizationDialog({ open, onOpenChange }) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCreate() {
    setLoading(true)
    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })

      if (!res.ok) throw new Error('Failed to create organization')

      const { organization } = await res.json()

      // Switch to new org
      await fetch('/api/organizations/switch', {
        method: 'POST',
        body: JSON.stringify({ organizationId: organization.id })
      })

      router.refresh()
      onOpenChange(false)
    } catch (error) {
      alert('Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer une organisation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nom de l'organisation</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mon Entreprise"
            />
          </div>
          <Button onClick={handleCreate} disabled={!name || loading}>
            {loading ? "Création..." : "Créer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**Intégrer dans WorkspaceSwitcher:**
```typescript
// components/dashboard/workspace-switcher.tsx (ligne 128)
const [createDialogOpen, setCreateDialogOpen] = useState(false)

// Remplacer le TODO par:
<Button onClick={() => setCreateDialogOpen(true)}>
  Créer une organisation
</Button>

<CreateOrganizationDialog
  open={createDialogOpen}
  onOpenChange={setCreateDialogOpen}
/>
```

---

#### 3. Error boundaries React (1h)
**Créer:** `components/error-boundary.tsx`

```typescript
"use client"

import { Component, ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    // Send to Sentry
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Une erreur est survenue</h2>
          <p className="text-gray-600 mb-4">
            {this.state.error?.message || "Erreur inconnue"}
          </p>
          <Button onClick={() => this.setState({ hasError: false })}>
            Réessayer
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
```

**Utiliser dans les layouts:**
```typescript
// app/dashboard/layout.tsx
import { ErrorBoundary } from "@/components/error-boundary"

export default function DashboardLayout({ children }) {
  return (
    <ErrorBoundary>
      {/* ... */}
      {children}
    </ErrorBoundary>
  )
}
```

---

#### 4. Toast notifications (1h)
**Installer:**
```bash
npm install sonner
```

**Configurer:**
```typescript
// app/layout.tsx
import { Toaster } from 'sonner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
```

**Utiliser partout:**
```typescript
// Exemple: components/dashboard/create-client-dialog.tsx
import { toast } from 'sonner'

// Success
toast.success('Client créé avec succès')

// Error
toast.error('Erreur lors de la création du client')

// Loading
const toastId = toast.loading('Création en cours...')
// ... await fetch
toast.success('Client créé', { id: toastId })
```

**Remplacer tous les `alert()` par `toast.error()`**

---

#### 5. Loading states (1h)
**Pattern à appliquer partout:**

```typescript
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function CreateClientDialog() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    try {
      await fetch('/api/clients', { method: 'POST', ... })
      toast.success('Client créé')
    } catch (error) {
      toast.error('Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleSubmit} disabled={loading}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? "Création..." : "Créer"}
    </Button>
  )
}
```

**Appliquer sur:**
- [ ] CreateClientDialog
- [ ] InvoiceForm
- [ ] BudgetForm
- [ ] Stripe checkout button
- [ ] Organization settings save
- [ ] Delete confirmations

---

#### 6. Test flow utilisateur complet (1h)
**Scénario manuel à suivre:**

```markdown
## Test Flow Complet

### 1. Inscription
- [ ] Aller sur /inscription
- [ ] Remplir formulaire (email: test@trajectory.fr, nom: Test User)
- [ ] Vérifier création automatique d'organisation
- [ ] Vérifier redirection vers /dashboard
- [ ] Vérifier email de bienvenue reçu

### 2. Créer un client
- [ ] Aller dans CRM
- [ ] Cliquer "Nouveau client"
- [ ] Remplir formulaire (nom, email, adresse)
- [ ] Vérifier toast de succès
- [ ] Vérifier client dans la liste
- [ ] Vérifier audit log créé

### 3. Créer une facture
- [ ] Aller dans Facturation
- [ ] Cliquer "Nouvelle facture"
- [ ] Sélectionner client créé
- [ ] Ajouter ligne de facturation (description, quantité, prix)
- [ ] Vérifier calcul automatique TVA et total
- [ ] Sauvegarder en brouillon
- [ ] Marquer comme "envoyée"
- [ ] Télécharger PDF
- [ ] Vérifier PDF contient toutes les infos

### 4. Upgrade subscription
- [ ] Aller dans Billing
- [ ] Cliquer "Upgrade to Starter"
- [ ] Compléter checkout Stripe (mode test)
- [ ] Vérifier webhook reçu
- [ ] Vérifier plan mis à jour dans dashboard
- [ ] Vérifier limites augmentées (100 clients au lieu de 10)

### 5. Inviter un membre
- [ ] Aller dans Settings > Team
- [ ] Inviter member@trajectory.fr avec rôle "Editor"
- [ ] Vérifier email d'invitation reçu
- [ ] Ouvrir lien d'invitation
- [ ] Accepter invitation
- [ ] Se déconnecter et se reconnecter en tant que member
- [ ] Vérifier permissions: peut créer client mais pas supprimer

### 6. Switch organization
- [ ] Créer 2ème organisation
- [ ] Switch entre les 2 organisations
- [ ] Vérifier données différentes (clients, factures)
- [ ] Vérifier workspace switcher fonctionne
```

---

## 📅 JOUR 3 - TESTS & QUALITÉ (8h)
> **Objectif:** Garantir la qualité et la fiabilité

### 🟢 Tests automatisés

#### 1. Setup Playwright (1h)
**Installer:**
```bash
npm install -D @playwright/test
npx playwright install
```

**Configuration:**
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

#### 2. Test E2E: Signup Flow (1h)
**Créer:** `e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should register new user and create organization', async ({ page }) => {
    // Go to signup
    await page.goto('/inscription')

    // Fill form
    const email = `test-${Date.now()}@trajectory.fr`
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', 'Password123!')
    await page.fill('input[name="organizationName"]', 'Test Org')

    // Submit
    await page.click('button[type="submit"]')

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard')

    // Check organization created
    await expect(page.locator('text=Test Org')).toBeVisible()

    // Check welcome email sent (mock check)
    // ...
  })

  test('should login existing user', async ({ page }) => {
    await page.goto('/connexion')
    await page.fill('input[name="email"]', 'demo@trajectory.fr')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    await page.waitForURL('/dashboard')
    await expect(page.locator('text=Tableau de bord')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/connexion')
    await page.fill('input[name="email"]', 'wrong@email.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=incorrect')).toBeVisible()
  })
})
```

---

#### 3. Test E2E: Invoice Flow (1h30)
**Créer:** `e2e/invoice.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Invoice Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/connexion')
    await page.fill('input[name="email"]', 'demo@trajectory.fr')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should create client and invoice with PDF download', async ({ page }) => {
    // 1. Create client
    await page.goto('/dashboard/crm')
    await page.click('button:has-text("Nouveau client")')

    await page.fill('input[name="name"]', 'Test Client E2E')
    await page.fill('input[name="email"]', 'client@test.com')
    await page.fill('input[name="phone"]', '0612345678')
    await page.click('button:has-text("Créer")')

    await expect(page.locator('text=Test Client E2E')).toBeVisible()

    // 2. Create invoice
    await page.goto('/dashboard/invoices')
    await page.click('button:has-text("Nouvelle facture")')

    // Select client
    await page.click('button[role="combobox"]')
    await page.click('text=Test Client E2E')

    // Add item
    await page.fill('input[name="items.0.description"]', 'Service de conseil')
    await page.fill('input[name="items.0.quantity"]', '5')
    await page.fill('input[name="items.0.unitPrice"]', '100')

    // Check total calculation
    await expect(page.locator('text=600,00 €')).toBeVisible() // 500 + 20% TVA

    // Save
    await page.click('button:has-text("Créer la facture")')

    await expect(page.locator('text=Facture créée')).toBeVisible()

    // 3. Download PDF
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button[title="Télécharger PDF"]')
    ])

    expect(download.suggestedFilename()).toMatch(/facture.*\.pdf/)

    // 4. Send invoice
    await page.click('button:has-text("Envoyer")')
    await expect(page.locator('text=Facture envoyée')).toBeVisible()
  })
})
```

---

#### 4. Test E2E: Stripe Subscription (1h)
**Créer:** `e2e/subscription.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Stripe Subscription', () => {
  test('should upgrade to Starter plan', async ({ page }) => {
    await page.goto('/connexion')
    await page.fill('input[name="email"]', 'demo@trajectory.fr')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Go to billing
    await page.goto('/dashboard/billing')

    // Check current plan
    await expect(page.locator('text=Trial')).toBeVisible()

    // Click upgrade
    await page.click('button:has-text("Passer à Starter")')

    // Should redirect to Stripe checkout
    await page.waitForURL(/checkout\.stripe\.com/)

    // Fill test card (Stripe test mode)
    await page.fill('input[name="cardNumber"]', '4242424242424242')
    await page.fill('input[name="cardExpiry"]', '12/34')
    await page.fill('input[name="cardCvc"]', '123')
    await page.fill('input[name="billingName"]', 'Test User')

    // Submit
    await page.click('button:has-text("Subscribe")')

    // Wait for redirect back
    await page.waitForURL('/dashboard/billing?success=true')

    // Check plan updated
    await expect(page.locator('text=Starter')).toBeVisible()
    await expect(page.locator('text=29€/mois')).toBeVisible()
  })

  test('should respect plan limits', async ({ page }) => {
    // Login as trial user
    // ...

    // Try to create 11th client (trial limit is 10)
    for (let i = 0; i < 11; i++) {
      const res = await page.request.post('/api/clients', {
        data: { name: `Client ${i}` }
      })

      if (i < 10) {
        expect(res.status()).toBe(201)
      } else {
        expect(res.status()).toBe(403)
        const body = await res.json()
        expect(body.error).toContain('limite')
      }
    }
  })
})
```

---

#### 5. Tests de performance (1h)
**Créer:** `tests/performance.test.ts`

```typescript
import { test, expect } from 'vitest'
import { prisma } from '@/lib/prisma'
import { createPrismaScoped } from '@/lib/prisma-scoped'

test('should handle 1000 clients efficiently', async () => {
  const orgId = 'test-org-id'
  const scoped = createPrismaScoped(orgId)

  // Create 1000 clients
  const startCreate = Date.now()
  await prisma.client.createMany({
    data: Array.from({ length: 1000 }, (_, i) => ({
      organizationId: orgId,
      name: `Client ${i}`,
      email: `client${i}@test.com`,
      status: 'active'
    }))
  })
  const createTime = Date.now() - startCreate

  console.log(`Created 1000 clients in ${createTime}ms`)
  expect(createTime).toBeLessThan(5000) // < 5s

  // Query all clients
  const startQuery = Date.now()
  const clients = await scoped.client.findMany({
    include: { invoices: true }
  })
  const queryTime = Date.now() - startQuery

  console.log(`Queried 1000 clients in ${queryTime}ms`)
  expect(queryTime).toBeLessThan(1000) // < 1s
  expect(clients).toHaveLength(1000)
})

test('API response time should be < 500ms', async () => {
  const times: number[] = []

  for (let i = 0; i < 10; i++) {
    const start = Date.now()
    await fetch('http://localhost:3000/api/clients')
    times.push(Date.now() - start)
  }

  const avgTime = times.reduce((a, b) => a + b) / times.length
  console.log(`Average response time: ${avgTime}ms`)

  expect(avgTime).toBeLessThan(500)
})
```

**Exécuter:**
```bash
npm run test tests/performance.test.ts
```

---

#### 6. Audit de sécurité OWASP (1h30)
**Checklist manuelle:**

```markdown
## OWASP Top 10 Security Checklist

### A01:2021 – Broken Access Control
- [x] Middleware protège toutes les routes sensibles
- [x] RBAC vérifié sur tous les endpoints API
- [x] Impossible d'accéder aux données d'une autre organisation
- [ ] Test: User A ne peut pas voir les clients de User B

### A02:2021 – Cryptographic Failures
- [x] Mots de passe hashés avec bcrypt (12 rounds)
- [x] HTTPS forcé en production
- [x] Tokens d'invitation sécurisés (crypto.randomBytes)
- [x] Sessions JWT avec secret fort

### A03:2021 – Injection
- [x] Prisma ORM protège contre SQL injection
- [x] Validation Zod sur toutes les entrées
- [ ] Test: Essayer `'; DROP TABLE users; --` dans un champ
- [x] Pas d'eval() ou Function() dans le code

### A04:2021 – Insecure Design
- [x] Rate limiting sur auth et création de ressources
- [x] Email verification (optional mais recommandé)
- [x] Audit logging de toutes les actions critiques
- [x] Soft delete plutôt que hard delete

### A05:2021 – Security Misconfiguration
- [ ] Vérifier headers de sécurité (CSP, X-Frame-Options)
- [ ] Désactiver stack traces en production
- [x] Variables d'environnement sécurisées
- [ ] Pas de fichiers sensibles exposés (.env, .git)

### A06:2021 – Vulnerable Components
- [ ] `npm audit` sans vulnérabilités critiques
- [x] Dépendances à jour
- [ ] Dependabot activé sur GitHub

### A07:2021 – Authentication Failures
- [x] Password minimum 8 caractères
- [x] Rate limiting sur login (5 tentatives/15min)
- [x] Session timeout configuré
- [ ] 2FA (feature future)

### A08:2021 – Software and Data Integrity
- [x] Webhook Stripe vérifié avec signature
- [x] Pas de CDN non sécurisés
- [x] Subresource Integrity si CDN externe

### A09:2021 – Logging Failures
- [x] Sentry configuré pour errors
- [x] Audit logs pour actions critiques
- [ ] Logs ne contiennent pas de données sensibles
- [ ] Logs rotation configurée

### A10:2021 – Server-Side Request Forgery
- [x] Pas d'URL user-controlled dans fetch()
- [x] Validation des callbacks/webhooks
```

**Actions:**
```bash
# 1. Check npm vulnerabilities
npm audit

# 2. Check security headers
curl -I https://trajectory-app.com | grep -i "x-frame\|strict-transport\|content-security"

# 3. Test SQL injection
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name": "'; DROP TABLE users; --"}'

# 4. Test XSS
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name": "<script>alert(1)</script>"}'
```

---

#### 7. Vérification RGPD (30min)
**Checklist:**

```markdown
## RGPD Compliance

### Consentement
- [x] Bandeau de cookies présent (react-cookie-consent)
- [x] Possibilité de refuser les cookies non essentiels
- [x] Cookies stockés uniquement après consentement

### Transparence
- [x] Politique de confidentialité accessible (/politique-confidentialite)
- [x] Politique de cookies (/cookies)
- [x] CGV disponibles (/cgv)
- [x] Contact DPO disponible

### Droits des utilisateurs
- [ ] Bouton "Télécharger mes données" (export JSON)
- [ ] Bouton "Supprimer mon compte" (soft delete + anonymisation)
- [ ] Bouton "Modifier mes données"

### Sécurité
- [x] Données chiffrées en transit (HTTPS)
- [x] Données chiffrées au repos (PostgreSQL encryption)
- [x] Mots de passe hashés
- [x] Audit logs des accès

### Minimisation
- [x] Collecte uniquement des données nécessaires
- [x] Pas de tracking tiers sans consentement
- [ ] Rétention limitée des logs (90 jours)
```

**À implémenter:**
```typescript
// app/api/user/export/route.ts
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  const userData = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      memberships: { include: { organization: true } },
      // ... toutes les données
    }
  })

  return new Response(JSON.stringify(userData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="my-data.json"'
    }
  })
}

// app/api/user/delete/route.ts
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)

  // Soft delete + anonymize
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      email: `deleted_${Date.now()}@trajectory.fr`,
      name: 'Utilisateur supprimé',
      password: '',
      // Keep audit logs but anonymize
    }
  })

  return NextResponse.json({ success: true })
}
```

---

## 📅 FINALISATION & DÉPLOIEMENT (2h)

#### 1. Documentation (30min)
**Mettre à jour README:**
```bash
# Ajouter section "Production Setup"
# Ajouter section "Security"
# Mettre à jour changelog
```

**Créer CHANGELOG.md:**
```markdown
# Changelog

## [1.0.0] - 2026-01-16 - Public Launch 🚀

### Added
- Multi-tenant architecture with RBAC
- Email invitations system
- Organization creation dialog
- Error boundaries and toast notifications
- Comprehensive E2E tests
- Security audit and OWASP compliance
- GDPR data export/delete

### Security
- Extended middleware protection
- Rate limiting on critical endpoints
- Sentry error monitoring
- Security headers configured

### Fixed
- All TODO items resolved
- Performance optimizations
- Loading states on all async actions
```

---

#### 2. Railway Deployment Check (30min)
**Vérifier:**

```bash
# 1. Environment variables
railway variables

# 2. Database migrations
railway run prisma db push
railway run npm run db:seed-rbac

# 3. Build success
railway logs --follow

# 4. Domain configured
railway domain

# 5. Stripe webhook
# → Update webhook URL in Stripe dashboard
# → Test webhook with Stripe CLI
stripe listen --forward-to https://trajectory-app.com/api/stripe/webhook
```

---

#### 3. Stripe Production Setup (30min)
**Passer en mode LIVE:**

1. **Dashboard Stripe → Developers → API Keys**
   - Copier `sk_live_...` (pas `sk_test_...`)
   - Copier webhook signing secret LIVE

2. **Railway Variables:**
   ```bash
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_... (LIVE)
   ```

3. **Webhook Production:**
   - URL: `https://trajectory-app.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`
   - Test: Créer vraie subscription avec carte de test

4. **Vérifier prix IDs:**
   - `STRIPE_PRICE_ID_STARTER` → prix LIVE
   - `STRIPE_PRICE_ID_PRO` → prix LIVE
   - `STRIPE_PRICE_ID_ENTERPRISE` → prix LIVE

---

#### 4. Test Production Final (30min)
**Scénario complet en prod:**

```markdown
## Final Production Test

### Setup
- [ ] Base de données production vide
- [ ] Stripe en mode LIVE
- [ ] Emails Resend configurés
- [ ] Sentry monitoring actif

### Test Flow
1. [ ] Inscription nouveau compte (votre vraie adresse email)
2. [ ] Vérifier email de bienvenue reçu
3. [ ] Créer 3 clients
4. [ ] Créer 2 factures
5. [ ] Télécharger PDF facture
6. [ ] Envoyer facture par email
7. [ ] Vérifier email facture reçu par client
8. [ ] Upgrade vers plan Starter (carte de test Stripe)
9. [ ] Vérifier webhook reçu et plan mis à jour
10. [ ] Inviter un membre (editor)
11. [ ] Accepter invitation
12. [ ] Vérifier permissions correctes
13. [ ] Créer 2ème organisation
14. [ ] Switch entre organisations
15. [ ] Tester limites de plan
16. [ ] Accéder à Stripe Portal
17. [ ] Annuler abonnement
18. [ ] Vérifier webhook cancellation

### Performance
- [ ] Temps de chargement page < 2s
- [ ] API response time < 500ms
- [ ] PDF generation < 3s
- [ ] Email envoyé < 5s

### Mobile
- [ ] Tester sur iPhone
- [ ] Tester sur Android
- [ ] Navigation mobile fluide
- [ ] Formulaires utilisables
```

---

## 🎯 Métriques de Succès

### Performance
- ✅ Lighthouse Score > 90
- ✅ First Contentful Paint < 1.5s
- ✅ API response time < 500ms
- ✅ PDF generation < 3s

### Sécurité
- ✅ 0 vulnérabilités npm critiques
- ✅ OWASP Top 10 compliance
- ✅ Rate limiting actif partout
- ✅ Audit logs fonctionnels

### Qualité
- ✅ 100% routes API protégées
- ✅ 90%+ code coverage (tests)
- ✅ 0 TODO dans code critique
- ✅ TypeScript strict mode

### UX
- ✅ 0 `alert()` restants
- ✅ Toast notifications partout
- ✅ Loading states sur toutes actions
- ✅ Error boundaries actifs

---

## 📋 Checklist Finale

```markdown
## Pre-Launch Checklist

### Code
- [ ] Tous les TODOs résolus
- [ ] TypeScript compile sans erreurs
- [ ] ESLint pas de warnings
- [ ] Tests passent (unit + E2E)

### Sécurité
- [ ] Middleware étendu
- [ ] Rate limiting actif
- [ ] RBAC vérifié partout
- [ ] npm audit clean
- [ ] Sentry configuré

### UX
- [ ] Email invitations fonctionnelles
- [ ] Organization creation dialog
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Loading states

### Production
- [ ] Railway deployed
- [ ] PostgreSQL production
- [ ] Stripe en mode LIVE
- [ ] Webhooks configurés
- [ ] Domain SSL actif
- [ ] Resend emails production

### Documentation
- [ ] README à jour
- [ ] CHANGELOG créé
- [ ] API documentation
- [ ] .env.example complet

### Tests
- [ ] Test flow complet en production
- [ ] Performance OK
- [ ] Mobile testé
- [ ] Emails reçus
- [ ] Stripe checkout fonctionne

### Legal
- [ ] RGPD compliance
- [ ] CGV finalisées
- [ ] Politique confidentialité
- [ ] Bandeau cookies

### Marketing
- [ ] Landing page finalisée
- [ ] Pricing page claire
- [ ] Email de lancement prêt
- [ ] Social media posts
```

---

## 🚀 Lancement

**Jour du lancement (J):**

**H-2h:**
- [ ] Backup base de données
- [ ] Vérifier monitoring actif
- [ ] Test final production

**H-1h:**
- [ ] Annoncer sur réseaux sociaux
- [ ] Envoyer email liste d'attente
- [ ] Communiqué de presse

**H:**
- [ ] 🎉 LANCEMENT PUBLIC
- [ ] Surveiller Sentry pour erreurs
- [ ] Monitorer signups
- [ ] Répondre aux premiers utilisateurs

**H+1h:**
- [ ] Check analytics
- [ ] Répondre aux feedbacks
- [ ] Corriger bugs critiques éventuels

**H+24h:**
- [ ] Rapport de lancement
- [ ] Plan d'amélioration
- [ ] Roadmap 30 jours

---

## 📞 Support

En cas de problème pendant ces 3 jours:
- **Email:** support@trajectory.fr
- **GitHub Issues:** https://github.com/red-tapir/trajectory-claude_code/issues
- **Monitoring:** Sentry dashboard

---

**Bonne chance pour le lancement! 🚀**
