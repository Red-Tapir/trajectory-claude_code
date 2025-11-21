# Migration Status - Multi-Tenant RBAC

**Session**: "Complete database migration and RBAC setup"
**Date**: November 2025
**Status**: ⚠️ **INCOMPLETE** - Code deployed but database migration pending

---

## ✅ Ce qui a été complété

### 1. Code Implementation (PR #5 - Merged)

Toute l'architecture multi-tenant et RBAC a été implémentée et déployée :

- ✅ **Schéma Prisma** mis à jour avec :
  - `Organization` (remplace `Company`)
  - `Role`, `Permission`, `RolePermission`
  - `OrganizationMember` (avec rôles)
  - `AuditLog` (logs de conformité)

- ✅ **Nouvelles librairies** créées :
  - `lib/permissions.ts` - Système de vérification des permissions
  - `lib/organization.ts` - Gestion des organisations
  - `lib/audit.ts` - Logs d'audit automatiques
  - `lib/prisma-scoped.ts` - Requêtes isolées par organisation

- ✅ **API Routes** créées :
  - `/api/organizations` - CRUD organisations
  - `/api/organizations/switch` - Changement d'organisation
  - `/api/organizations/[id]/members` - Gestion des membres

- ✅ **Composants UI** :
  - `WorkspaceSwitcher` - Sélecteur d'organisation
  - `DropdownMenu` (Radix UI)

- ✅ **Scripts de migration** créés :
  - `prisma/seed-rbac.ts` - Seed des rôles et permissions
  - `prisma/backfill-organizations.ts` - Migration des données existantes

- ✅ **Documentation** :
  - `MIGRATION_GUIDE.md` - Guide complet de migration

### 2. Déploiement

- ✅ Code mergé dans `main` via PR #5
- ✅ Déployé sur Vercel automatiquement
- ✅ Dépendances installées (@radix-ui/react-dropdown-menu)

---

## ❌ Ce qui reste à faire - CRITIQUE

### ⚠️ **Problème** : Les migrations de base de données n'ont PAS été exécutées

La session a buggé avant de compléter les 3 étapes critiques suivantes sur la base de données **Supabase** :

### Étape 1 : Appliquer les migrations Prisma
```bash
npx prisma migrate deploy
```
**Ce que ça fait** : Crée les nouvelles tables (`Organization`, `Role`, `Permission`, etc.) dans la base de données PostgreSQL.

### Étape 2 : Seed des rôles et permissions
```bash
npm run db:seed-rbac
```
**Ce que ça fait** :
- Crée 5 rôles système : `owner`, `admin`, `manager`, `editor`, `viewer`
- Crée 48 permissions granulaires (ex: `client:create`, `invoice:delete`)
- Associe les permissions aux rôles

### Étape 3 : Migration des données existantes
```bash
npm run db:backfill-orgs
```
**Ce que ça fait** :
- Migre les données de `Company` vers `Organization`
- Génère des slugs uniques pour chaque organisation
- Convertit `CompanyMember` en `OrganizationMember` avec rôles
- Met à jour `currentOrganizationId` pour tous les utilisateurs

---

## 🚨 Impact actuel

**L'application est probablement cassée en production** car :

1. ❌ Les nouvelles tables n'existent pas dans la base de données
2. ❌ Le code fait référence au modèle `Organization` mais la table n'existe pas
3. ❌ Les rôles et permissions ne sont pas créés
4. ❌ Les données existantes ne sont pas migrées

**Erreurs attendues** :
- `Table 'Organization' does not exist`
- `Role 'owner' not found`
- Authentification échoue (pas d'organisation pour les utilisateurs)

---

## 🔧 Comment compléter la migration

### Option A : Migration depuis votre machine locale (RECOMMANDÉ)

1. **Cloner le repo et installer les dépendances**
```bash
git clone https://github.com/Red-Tapir/trajectory-claude_code.git
cd trajectory-claude_code
npm install
```

2. **Configurer la connexion à la base de données Supabase**

Créez un fichier `.env` avec vos credentials Supabase :
```env
# Copier depuis Supabase Dashboard > Settings > Database > Connection Pooling
DATABASE_URL="postgresql://postgres.xxx:password@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Copier depuis Supabase Dashboard > Settings > Database > Connection String (Direct)
DIRECT_URL="postgresql://postgres.xxx:password@aws-1-eu-north-1.pooler.supabase.com:5432/postgres"
```

3. **Exécuter les migrations dans l'ordre**
```bash
# Étape 1 : Créer les tables
npx prisma migrate deploy

# Étape 2 : Seed RBAC (rôles et permissions)
npm run db:seed-rbac

# Étape 3 : Migrer les données existantes
npm run db:backfill-orgs
```

4. **Vérifier que tout fonctionne**
```bash
# Tester la connexion
npx prisma db pull

# Vérifier les données
npx prisma studio
```

### Option B : Migration depuis Supabase SQL Editor (Si pas d'accès local)

1. Allez dans **Supabase Dashboard > SQL Editor**

2. Exécutez le SQL généré par Prisma :
```bash
# Générez le SQL depuis votre machine locale
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migration.sql
```

3. Exécutez manuellement les scripts de seed en adaptant le code TypeScript en SQL

⚠️ **Note** : Cette option est plus complexe et sujette aux erreurs. L'option A est fortement recommandée.

---

## 📋 Checklist de vérification

Après avoir complété les migrations, vérifiez :

- [ ] Table `Organization` existe dans Supabase
- [ ] Table `Role` contient 5 rôles (owner, admin, manager, editor, viewer)
- [ ] Table `Permission` contient ~48 permissions
- [ ] Table `RolePermission` contient les associations
- [ ] Table `OrganizationMember` contient les membres migrés
- [ ] Les utilisateurs ont un `currentOrganizationId` non-null
- [ ] L'application se charge sans erreur dans le navigateur
- [ ] La connexion fonctionne
- [ ] Le dashboard affiche des données

---

## 🆘 Support

Si vous rencontrez des erreurs :

1. **Vérifier les logs Vercel** : https://vercel.com/red-tapir/trajectory/deployments
2. **Vérifier les logs Supabase** : Supabase Dashboard > Logs
3. **Vérifier que DATABASE_URL est correct** dans Vercel (Settings > Environment Variables)

### Erreurs communes

**"Table 'Organization' does not exist"**
→ Étape 1 pas exécutée, lancez `npx prisma migrate deploy`

**"Role 'owner' not found"**
→ Étape 2 pas exécutée, lancez `npm run db:seed-rbac`

**"User has no organization"**
→ Étape 3 pas exécutée, lancez `npm run db:backfill-orgs`

---

## 📝 Système de Rôles implémenté

| Rôle | Priority | Permissions |
|------|----------|-------------|
| **Owner** | 100 | ✅ Tout (wildcard `*`) |
| **Admin** | 90 | ✅ Tout sauf suppression org et transfert propriété |
| **Manager** | 70 | ✅ Clients, Factures, Budgets, Rapports<br>👀 Membres (lecture seule) |
| **Editor** | 50 | ✅ Créer/modifier clients et factures<br>❌ Pas de suppression |
| **Viewer** | 10 | 👀 Lecture seule sur tout |

---

**Prochaines étapes** : Exécuter les 3 commandes de migration sur la base de données production Supabase.
